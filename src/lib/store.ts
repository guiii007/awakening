import { create } from "zustand";
import type {
  EventRecord,
  TradeoffNote,
  DialogSession,
  UserProgress,
  StatsSnapshot,
  TriggerType,
} from "./types";
import { StorageService, uid } from "./storage";

interface AppState {
  // 数据
  events: EventRecord[];
  tradeoffs: TradeoffNote[];
  dialogs: DialogSession[];
  progress: UserProgress | null;
  stats: StatsSnapshot | null;
  encrypted: boolean;
  loaded: boolean;

  // 操作
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  addEvent: (e: Omit<EventRecord, "id" | "timestamp">) => Promise<EventRecord>;
  addTradeoff: (t: Omit<TradeoffNote, "id" | "timestamp">) => Promise<TradeoffNote>;
  deleteTradeoff: (id: string) => Promise<void>;
  addDialog: (d: DialogSession) => Promise<void>;
  updateDialog: (id: string, messages: DialogSession["messages"]) => Promise<void>;
  enableEncryption: (pin: string) => Promise<void>;
  disableEncryption: () => Promise<void>;
  resetData: () => Promise<void>;
  incrementDailyQuoteCount: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  events: [],
  tradeoffs: [],
  dialogs: [],
  progress: null,
  stats: null,
  encrypted: false,
  loaded: false,

  init: async () => {
    try {
      await StorageService.init();
      await get().refresh();
      set({ encrypted: StorageService.isEncrypted(), loaded: true });
    } catch (e) {
      console.error("初始化失败:", e);
      set({ loaded: true });
    }
  },

  refresh: async () => {
    const [events, tradeoffs, dialogs, progress, stats] = await Promise.all([
      StorageService.getEvents(),
      StorageService.getTradeoffs(),
      StorageService.getDialogs(),
      StorageService.getProgress(),
      StorageService.getStats(),
    ]);
    set({ events, tradeoffs, dialogs, progress, stats });
  },

  addEvent: async (e) => {
    const full: EventRecord = { ...e, id: uid(), timestamp: Date.now() };
    await StorageService.addEvent(full);
    await get().refresh();
    return full;
  },

  addTradeoff: async (t) => {
    const full: TradeoffNote = { ...t, id: uid(), timestamp: Date.now() };
    await StorageService.addTradeoff(full);
    await get().refresh();
    return full;
  },

  deleteTradeoff: async (id) => {
    await StorageService.deleteTradeoff(id);
    await get().refresh();
  },

  addDialog: async (d) => {
    await StorageService.addDialog(d);
    await get().refresh();
  },

  updateDialog: async (id, messages) => {
    const list = await StorageService.getDialogs();
    const target = list.find((d) => d.id === id);
    if (target) {
      target.messages = messages;
      await StorageService.addDialog(target);
    }
    await get().refresh();
  },

  enableEncryption: async (pin) => {
    await StorageService.enableEncryption(pin);
    set({ encrypted: true });
    await get().refresh();
  },

  disableEncryption: async () => {
    await StorageService.disableEncryption();
    set({ encrypted: false });
    await get().refresh();
  },

  resetData: async () => {
    await StorageService.resetData();
    set({ events: [], tradeoffs: [], dialogs: [], progress: null, stats: null, encrypted: false });
  },

  incrementDailyQuoteCount: async () => {
    await StorageService.incrementDailyQuoteCount();
    await get().refresh();
  },
}));

// 触发类型选项
export const TRIGGER_OPTIONS: { value: TriggerType; label: string; emoji: string }[] = [
  { value: "anxiety", label: "焦虑", emoji: "🌊" },
  { value: "stress", label: "压力", emoji: "⛰️" },
  { value: "loneliness", label: "孤独", emoji: "🌙" },
  { value: "fatigue", label: "疲惫", emoji: "🌫️" },
  { value: "boredom", label: "无聊", emoji: "🍃" },
  { value: "craving", label: "欲望", emoji: "🔥" },
  { value: "other", label: "其他", emoji: "✨" },
];
