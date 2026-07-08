import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_API_URL,
  DEEPSEEK_MODEL,
  PERSONALITY_PROMPTS,
  BASE_SYSTEM_PROMPT,
  type PersonalityType,
} from "./config";
import type { TriggerType, TradeoffNote, EventRecord, DialogMessage } from "./types";
import { TRIGGER_LABELS } from "./types";
import { generateAIReply } from "./aiEngine";

// 构造发给 DeepSeek 的 system prompt（含性格 + 上下文摘要）
function buildSystemPrompt(
  personality: PersonalityType,
  context: {
    trigger?: TriggerType | "none";
    recentRestrain?: EventRecord[];
    tradeoffs?: TradeoffNote[];
  } = {},
): string {
  const personalityPrompt = PERSONALITY_PROMPTS[personality];
  const parts: string[] = [BASE_SYSTEM_PROMPT, "", personalityPrompt];

  // 注入用户上下文（让 AI 知道用户的历史）
  const ctxLines: string[] = [];
  if (context.trigger && context.trigger !== "none") {
    ctxLines.push(`用户当前标注的情绪诱因：${TRIGGER_LABELS[context.trigger]}`);
  }
  if (context.recentRestrain && context.recentRestrain.length > 0) {
    const last = context.recentRestrain[0];
    ctxLines.push(`用户最近一次克制成功的场景：${last.scenario || "未记录"}（诱因：${TRIGGER_LABELS[last.trigger]}）`);
    if (last.outcomeNote) ctxLines.push(`当时的感受笔记：${last.outcomeNote}`);
  }
  if (context.tradeoffs && context.tradeoffs.length > 0) {
    const t = context.tradeoffs[0];
    ctxLines.push(`用户写下的长期目标：${t.longGoal}`);
    if (t.longReward) ctxLines.push(`长期收益：${t.longReward}`);
  }
  if (ctxLines.length > 0) {
    parts.push("", "【用户上下文（仅供你参考，不要原样复述）】", ctxLines.join("\n"));
  }

  return parts.join("\n");
}

// 把本地消息格式转成 DeepSeek API 格式
function toApiMessages(messages: DialogMessage[], systemPrompt: string) {
  const result: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];
  for (const m of messages) {
    result.push({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    });
  }
  return result;
}

export interface StreamCallbacks {
  onChunk: (text: string) => void; // 增量文本
  onDone: (full: string) => void;
  onError: (err: Error) => void;
}

// 流式调用 DeepSeek，失败时回退到本地引擎
export async function streamChat(
  messages: DialogMessage[],
  personality: PersonalityType,
  context: {
    trigger?: TriggerType | "none";
    recentRestrain?: EventRecord[];
    tradeoffs?: TradeoffNote[];
  },
  callbacks: StreamCallbacks,
): Promise<void> {
  const systemPrompt = buildSystemPrompt(personality, context);
  const apiMessages = toApiMessages(messages, systemPrompt);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: apiMessages,
        stream: true,
        temperature: 0.85,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`DeepSeek API ${res.status}: ${errText.slice(0, 200)}`);
    }

    if (!res.body) throw new Error("无响应流");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE 格式：每条以 data: 开头，以 \n\n 分隔
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") {
          callbacks.onDone(full);
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            callbacks.onChunk(delta);
          }
        } catch {
          // 忽略解析失败的行
        }
      }
    }

    if (full) {
      callbacks.onDone(full);
    } else {
      throw new Error("空响应");
    }
  } catch (err) {
    // 回退到本地引擎
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const fallback = generateAIReply(lastUser?.content || "", {
      trigger: context.trigger,
      recentRestrain: context.recentRestrain,
      tradeoffs: context.tradeoffs,
      turn: messages.filter((m) => m.role === "user").length,
    });
    // 逐字回放兜底内容，模拟流式
    let i = 0;
    await new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        i += 2;
        const chunk = fallback.slice(Math.max(0, i - 2), i);
        if (chunk) callbacks.onChunk(chunk);
        if (i >= fallback.length) {
          clearInterval(timer);
          callbacks.onDone(fallback);
          resolve();
        }
      }, 30);
    });
    // 静默处理错误，不抛给上层
    if (err instanceof Error) {
      console.warn("DeepSeek 调用失败，已回退本地引擎:", err.message);
    }
  }
}
