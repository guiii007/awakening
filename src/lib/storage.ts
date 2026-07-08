import { get, set, del, clear, createStore } from "idb-keyval";
import type {
  EventRecord,
  TradeoffNote,
  DialogSession,
  UserProgress,
  StatsSnapshot,
  MetaRecord,
  TriggerType,
} from "./types";

// 独立的 IndexedDB store
const store = createStore("awakening-db", "awakening-store");

const KEYS = {
  events: "events",
  tradeoffs: "tradeoffs",
  dialogs: "dialogs",
  progress: "progress",
  meta: "meta",
};

// ===== 加密层（AES-GCM，基于用户 PIN + 盐 PBKDF2 派生密钥）=====
const enc = new TextEncoder();
const dec = new TextDecoder();

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptStr(plain: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
  return bufToB64(ct);
}

async function decryptStr(cipher: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, b64ToBuf(cipher));
  return dec.decode(pt);
}

// 缓存当前加密状态与密钥
let cryptoState: { encrypted: boolean; key: CryptoKey | null; iv: Uint8Array | null } = {
  encrypted: false,
  key: null,
  iv: null,
};

async function loadCryptoState(pin?: string): Promise<void> {
  const meta = (await get<MetaRecord>(KEYS.meta, store)) || { encrypted: false };
  if (meta.encrypted && pin && meta.salt && meta.iv) {
    const salt = new Uint8Array(b64ToBuf(meta.salt));
    const iv = new Uint8Array(b64ToBuf(meta.iv));
    const key = await deriveKey(pin, salt);
    cryptoState = { encrypted: true, key, iv };
  } else {
    cryptoState = { encrypted: meta.encrypted, key: null, iv: null };
  }
}

async function wrapWrite<T>(value: T): Promise<string | T> {
  if (cryptoState.encrypted && cryptoState.key && cryptoState.iv) {
    return encryptStr(JSON.stringify(value), cryptoState.key, cryptoState.iv);
  }
  return value;
}

async function unwrapRead<T>(raw: unknown): Promise<T> {
  if (raw == null) return raw as T;
  if (cryptoState.encrypted && cryptoState.key && cryptoState.iv && typeof raw === "string") {
    const plain = await decryptStr(raw, cryptoState.key, cryptoState.iv);
    return JSON.parse(plain) as T;
  }
  return raw as T;
}

// ===== 工具函数 =====
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgoKey(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayKey(d);
}

// ===== 默认进度 =====
const DEFAULT_PROGRESS: UserProgress = {
  totalRestrain: 0,
  totalRelapse: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastEventDate: null,
  dailyQuoteCount: 0,
};

// ===== StorageService 单例 =====
export const StorageService = {
  async init(pin?: string): Promise<void> {
    await loadCryptoState(pin);
  },

  isEncrypted(): boolean {
    return cryptoState.encrypted;
  },

  // 开启加密：设置 PIN
  async enableEncryption(pin: string): Promise<void> {
    if (pin.length < 4) throw new Error("PIN 至少 4 位");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pin, salt);
    cryptoState = { encrypted: true, key, iv };

    // 重新加密已有数据
    const [events, tradeoffs, dialogs, progress] = await Promise.all([
      get<EventRecord[]>(KEYS.events, store),
      get<TradeoffNote[]>(KEYS.tradeoffs, store),
      get<DialogSession[]>(KEYS.dialogs, store),
      get<UserProgress>(KEYS.progress, store),
    ]);
    if (events) await set(KEYS.events, await wrapWrite(events), store);
    if (tradeoffs) await set(KEYS.tradeoffs, await wrapWrite(tradeoffs), store);
    if (dialogs) await set(KEYS.dialogs, await wrapWrite(dialogs), store);
    if (progress) await set(KEYS.progress, await wrapWrite(progress), store);

    const meta: MetaRecord = {
      encrypted: true,
      salt: bufToB64(salt.buffer),
      iv: bufToB64(iv.buffer),
    };
    await set(KEYS.meta, meta, store);
  },

  // 关闭加密：解密全部数据后明文回写
  async disableEncryption(): Promise<void> {
    if (!cryptoState.encrypted) return;
    const [events, tradeoffs, dialogs, progress] = await Promise.all([
      this.getEvents(),
      this.getTradeoffs(),
      this.getDialogs(),
      this.getProgress(),
    ]);
    cryptoState = { encrypted: false, key: null, iv: null };
    await set(KEYS.events, events, store);
    await set(KEYS.tradeoffs, tradeoffs, store);
    await set(KEYS.dialogs, dialogs, store);
    await set(KEYS.progress, progress, store);
    await set(KEYS.meta, { encrypted: false }, store);
  },

  async getEvents(): Promise<EventRecord[]> {
    const raw = await get(KEYS.events, store);
    return (await unwrapRead<EventRecord[]>(raw)) || [];
  },

  async addEvent(event: EventRecord): Promise<void> {
    const list = await this.getEvents();
    list.push(event);
    await set(KEYS.events, await wrapWrite(list), store);
    await this.recomputeProgress(event);
  },

  async getTradeoffs(): Promise<TradeoffNote[]> {
    const raw = await get(KEYS.tradeoffs, store);
    return (await unwrapRead<TradeoffNote[]>(raw)) || [];
  },

  async addTradeoff(note: TradeoffNote): Promise<void> {
    const list = await this.getTradeoffs();
    list.push(note);
    await set(KEYS.tradeoffs, await wrapWrite(list), store);
  },

  async deleteTradeoff(id: string): Promise<void> {
    const list = (await this.getTradeoffs()).filter((t) => t.id !== id);
    await set(KEYS.tradeoffs, await wrapWrite(list), store);
  },

  async getDialogs(): Promise<DialogSession[]> {
    const raw = await get(KEYS.dialogs, store);
    return (await unwrapRead<DialogSession[]>(raw)) || [];
  },

  async addDialog(session: DialogSession): Promise<void> {
    const list = await this.getDialogs();
    const idx = list.findIndex((d) => d.id === session.id);
    if (idx >= 0) list[idx] = session;
    else list.push(session);
    await set(KEYS.dialogs, await wrapWrite(list), store);
  },

  async getProgress(): Promise<UserProgress> {
    const raw = await get(KEYS.progress, store);
    return (await unwrapRead<UserProgress>(raw)) || { ...DEFAULT_PROGRESS };
  },

  async setProgress(p: UserProgress): Promise<void> {
    await set(KEYS.progress, await wrapWrite(p), store);
  },

  // 根据新事件重算连胜
  async recomputeProgress(event: EventRecord): Promise<void> {
    const p = await this.getProgress();
    if (event.type === "restrain") {
      p.totalRestrain += 1;
      const today = todayKey();
      if (p.lastEventDate !== today) {
        // 判断是否连续
        const yesterday = daysAgoKey(1);
        if (p.lastEventDate === yesterday || p.lastEventDate === null) {
          p.currentStreak += 1;
        } else {
          p.currentStreak = 1; // 中断重置
        }
        p.lastEventDate = today;
      }
      if (p.currentStreak > p.bestStreak) p.bestStreak = p.currentStreak;
    } else {
      p.totalRelapse += 1;
      p.currentStreak = 0;
      p.lastEventDate = todayKey();
    }
    await set(KEYS.progress, await wrapWrite(p), store);
  },

  async incrementDailyQuoteCount(): Promise<void> {
    const p = await this.getProgress();
    p.dailyQuoteCount = (p.dailyQuoteCount || 0) + 1;
    await set(KEYS.progress, await wrapWrite(p), store);
  },

  async getStats(): Promise<StatsSnapshot> {
    const [events, progress] = await Promise.all([this.getEvents(), this.getProgress()]);
    const total = events.length || 1;
    const successRate = Math.round((progress.totalRestrain / (progress.totalRestrain + progress.totalRelapse)) * 100) || 0;

    // 诱因分布
    const triggerMap = new Map<TriggerType, number>();
    events.forEach((e) => triggerMap.set(e.trigger, (triggerMap.get(e.trigger) || 0) + 1));
    const triggerDistribution = Array.from(triggerMap.entries())
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count);

    // 近 30 天趋势
    const trend30: { date: string; restrain: number; relapse: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const key = daysAgoKey(i);
      trend30.push({ date: key.slice(5), restrain: 0, relapse: 0 });
    }
    events.forEach((e) => {
      const key = todayKey(new Date(e.timestamp)).slice(5);
      const item = trend30.find((t) => t.date === key);
      if (item) {
        if (e.type === "restrain") item.restrain += 1;
        else item.relapse += 1;
      }
    });

    return {
      totalRestrain: progress.totalRestrain,
      totalRelapse: progress.totalRelapse,
      successRate,
      currentStreak: progress.currentStreak,
      bestStreak: progress.bestStreak,
      dailyQuoteCount: progress.dailyQuoteCount || 0,
      triggerDistribution,
      trend30,
    };
  },

  async exportData(): Promise<string> {
    const [events, tradeoffs, dialogs, progress, meta] = await Promise.all([
      this.getEvents(),
      this.getTradeoffs(),
      this.getDialogs(),
      this.getProgress(),
      get<MetaRecord>(KEYS.meta, store),
    ]);
    return JSON.stringify(
      { events, tradeoffs, dialogs, progress, meta: { encrypted: meta?.encrypted || false }, exportedAt: Date.now() },
      null,
      2,
    );
  },

  async resetData(): Promise<void> {
    await clear(store);
    cryptoState = { encrypted: false, key: null, iv: null };
  },
};

export { todayKey, daysAgoKey };
