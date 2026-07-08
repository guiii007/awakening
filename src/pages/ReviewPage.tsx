import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Quote, Filter } from "lucide-react";
import { useStore } from "@/lib/store";
import { generateReviewSummary } from "@/lib/aiEngine";
import { TRIGGER_LABELS, TRIGGER_COLORS, type TriggerType } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";

export default function ReviewPage() {
  const events = useStore((s) => s.events);
  const tradeoffs = useStore((s) => s.tradeoffs);
  const [filter, setFilter] = useState<TriggerType | "all">("all");

  const restrains = useMemo(
    () => events.filter((e) => e.type === "restrain").reverse(),
    [events],
  );
  const filtered = filter === "all" ? restrains : restrains.filter((e) => e.trigger === filter);
  const summary = useMemo(() => generateReviewSummary(events, tradeoffs), [events, tradeoffs]);

  const triggerTypes = Array.from(new Set(restrains.map((e) => e.trigger)));

  return (
    <div>
      <PageHeader
        eyebrow="过往经历复盘"
        title="你曾经做到过，这次也能"
        subtitle="回看每一次克制，唤醒当时的成就感。理智不是天赋，是你一次次练习出来的肌肉。"
      />

      {/* AI 复盘总结 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6 mb-7 bg-gradient-to-br from-sage-100/40 to-cream-50"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-300 to-dusk-300 flex items-center justify-center shrink-0 shadow-glow">
            <Sparkles className="w-5 h-5 text-cream-50" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="text-xs tracking-widest text-sage-400 uppercase font-medium mb-1.5">AI 复盘总结</p>
            <p className="text-sm text-ink-600 leading-relaxed font-serif">{summary}</p>
          </div>
        </div>
      </motion.div>

      {/* 过滤器 */}
      {triggerTypes.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-xs text-ink-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> 诱因：
          </span>
          <button
            onClick={() => setFilter("all")}
            className={`chip text-xs ${filter === "all" ? "bg-dawn-300 text-cream-50" : "bg-cream-100 text-ink-400 hover:bg-cream-200"}`}
          >
            全部 {restrains.length}
          </button>
          {triggerTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`chip text-xs ${filter === t ? "bg-dawn-300 text-cream-50" : "bg-cream-100 text-ink-400 hover:bg-cream-200"}`}
            >
              {TRIGGER_LABELS[t]} {restrains.filter((e) => e.trigger === t).length}
            </button>
          ))}
        </div>
      )}

      {/* 复盘卡片流 */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-10 h-10 text-cream-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="font-serif text-lg text-ink-500">还没有克制记录</p>
          <p className="text-sm text-ink-400 mt-1">下一次冲动来临时，按下救援按钮，记录下你的第一次胜利</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((e, idx) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
              className="card card-hover p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: TRIGGER_COLORS[e.trigger] }}
                />
                <span className="chip text-xs" style={{ background: `${TRIGGER_COLORS[e.trigger]}22`, color: "#3A3633" }}>
                  {TRIGGER_LABELS[e.trigger]}
                </span>
                <span className="text-xs text-ink-400 ml-auto">
                  {new Date(e.timestamp).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })}
                </span>
              </div>
              {e.scenario && (
                <div className="mb-3">
                  <p className="text-[11px] text-ink-400 mb-1">当时的场景</p>
                  <p className="text-sm text-ink-600 leading-relaxed">{e.scenario}</p>
                </div>
              )}
              {e.outcomeNote && (
                <div className="rounded-2xl bg-sage-100/40 p-3 flex items-start gap-2">
                  <Quote className="w-4 h-4 text-sage-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                  <p className="text-sm text-ink-600 leading-relaxed italic">{e.outcomeNote}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
