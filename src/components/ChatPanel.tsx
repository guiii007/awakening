import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { generateAIReply } from "@/lib/aiEngine";
import { streamChat } from "@/lib/deepseek";
import { PERSONALITIES, type PersonalityType } from "@/lib/config";
import { uid } from "@/lib/storage";
import { TRIGGER_OPTIONS } from "@/lib/store";
import type { DialogMessage, DialogSession, TriggerType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  trigger?: TriggerType | "none";
  compact?: boolean;
  onSessionEnd?: (session: DialogSession) => void;
}

export default function ChatPanel({ trigger = "none", compact = false, onSessionEnd }: ChatPanelProps) {
  const events = useStore((s) => s.events);
  const tradeoffs = useStore((s) => s.tradeoffs);
  const addDialog = useStore((s) => s.addDialog);

  const [messages, setMessages] = useState<DialogMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [displayedAi, setDisplayedAi] = useState("");
  const [currentTrigger, setCurrentTrigger] = useState<TriggerType | "none">(trigger);
  const [personality, setPersonality] = useState<PersonalityType>("empathy");
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(uid());
  // 中断当前流式请求的句柄
  const abortRef = useRef<(() => void) | null>(null);

  // 初始问候（用本地引擎，避免开场就请求 API）
  useEffect(() => {
    const greeting = generateAIReply("", { trigger: currentTrigger, recentRestrain: restrains(), tradeoffs, turn: 0 });
    const msg: DialogMessage = { id: uid(), role: "ai", content: greeting, timestamp: Date.now() };
    setMessages([msg]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, displayedAi, typing]);

  function restrains() {
    return events.filter((e) => e.type === "restrain").slice(-5).reverse();
  }

  async function send() {
    if (!input.trim() || typing) return;
    const userMsg: DialogMessage = { id: uid(), role: "user", content: input.trim(), timestamp: Date.now() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setTyping(true);
    setDisplayedAi("");

    // 构造要发给 API 的消息（不含初始问候，避免干扰；保留最近 8 条）
    const apiMsgs = newMsgs.slice(-8);

    let accumulated = "";
    let aborted = false;
    abortRef.current = () => { aborted = true; };

    await streamChat(
      apiMsgs,
      personality,
      {
        trigger: currentTrigger,
        recentRestrain: restrains(),
        tradeoffs,
      },
      {
        onChunk: (delta) => {
          if (aborted) return;
          accumulated += delta;
          setDisplayedAi(accumulated);
        },
        onDone: (full) => {
          if (aborted) return;
          const finalText = full || accumulated;
          const aiMsg: DialogMessage = { id: uid(), role: "ai", content: finalText, timestamp: Date.now() };
          const finalMsgs = [...newMsgs, aiMsg];
          setMessages(finalMsgs);
          setDisplayedAi("");
          setTyping(false);
          abortRef.current = null;
          // 持久化会话
          const session: DialogSession = {
            id: sessionId.current,
            timestamp: Date.now(),
            trigger: currentTrigger,
            messages: finalMsgs,
          };
          addDialog(session);
          onSessionEnd?.(session);
        },
        onError: () => {
          // streamChat 内部已回退到本地引擎，这里无需额外处理
        },
      },
    );
  }

  return (
    <div className={cn("flex flex-col", compact ? "h-[460px]" : "h-[calc(100vh-220px)] min-h-[460px]")}>
      {/* 情绪标签 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {TRIGGER_OPTIONS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setCurrentTrigger(t.value)}
            className={cn(
              "chip text-xs",
              currentTrigger === t.value
                ? "bg-dawn-300 text-cream-50"
                : "bg-white text-ink-700 hover:bg-cream-100 border border-cream-200 dark:bg-night-200 dark:text-ink-dark dark:hover:bg-night-300 dark:border-night-50/30",
            )}
          >
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* 性格选择 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[11px] text-ink-400 mr-1">小醒的性格：</span>
        {PERSONALITIES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPersonality(p.value)}
            title={p.desc}
            className={cn(
              "chip text-xs transition",
              personality === p.value
                ? "bg-sage-300 text-cream-50 shadow-soft"
                : "bg-white text-ink-700 hover:bg-cream-100 border border-cream-200 dark:bg-night-200 dark:text-ink-dark dark:hover:bg-night-300 dark:border-night-50/30",
            )}
          >
            <span>{p.emoji}</span> {p.label}
          </button>
        ))}
      </div>

      {/* 消息列表 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex items-end gap-2", m.role === "user" && "flex-row-reverse")}
            >
              {m.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dawn-300 to-gold-400 flex items-center justify-center shrink-0 shadow-glow">
                  <Sparkles className="w-3.5 h-3.5 text-cream-50" strokeWidth={1.8} />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[78%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "ai"
                    ? "bg-white rounded-3xl rounded-bl-md text-ink-700 border border-cream-200 dark:bg-night-200 dark:text-ink-dark dark:border-night-50/30"
                    : "bg-dawn-300 text-cream-50 rounded-3xl rounded-br-md",
                )}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dawn-300 to-gold-400 flex items-center justify-center shrink-0 shadow-glow">
              <Sparkles className="w-3.5 h-3.5 text-cream-50" strokeWidth={1.8} />
            </div>
            <div className="bg-white rounded-3xl rounded-bl-md px-4 py-2.5 text-sm text-ink-700 border border-cream-200 min-w-[60px] dark:bg-night-200 dark:text-ink-dark dark:border-night-50/30">
              {displayedAi || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-dawn-300 animate-breath" />
                  <span className="w-1.5 h-1.5 rounded-full bg-dawn-300 animate-breath" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-dawn-300 animate-breath" style={{ animationDelay: "0.4s" }} />
                </span>
              )}
              {displayedAi && <span className="inline-block w-0.5 h-3.5 bg-dawn-400 ml-0.5 animate-pulse align-middle" />}
            </div>
          </motion.div>
        )}
      </div>

      {/* 输入框 */}
      <div className="mt-3 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="和它说说你现在的感受…"
          rows={1}
          className="input-soft resize-none max-h-24 py-2.5"
        />
        <button type="button" onClick={send} disabled={!input.trim() || typing} className="btn-primary shrink-0 px-4 py-2.5">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
