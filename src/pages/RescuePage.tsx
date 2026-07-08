import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, RotateCcw, Wind, MessageCircleHeart, History, Trophy, Sparkles } from "lucide-react";
import { useStore, TRIGGER_OPTIONS } from "@/lib/store";
import { TRIGGER_LABELS, type TriggerType, type EventRecord } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import ChatPanel from "@/components/ChatPanel";
import CelebrationModal from "@/components/CelebrationModal";

type Step = "countdown" | "chat" | "review" | "record" | "done";

const COUNTDOWN_SECONDS = 60;
const BREATH_PHASES = [
  { label: "吸气", duration: 4 },
  { label: "屏息", duration: 7 },
  { label: "呼气", duration: 8 },
];

export default function RescuePage() {
  const navigate = useNavigate();
  const addEvent = useStore((s) => s.addEvent);
  const events = useStore((s) => s.events);

  const [step, setStep] = useState<Step>("countdown");
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [breathPhase, setBreathPhase] = useState(0);
  const [trigger, setTrigger] = useState<TriggerType>("craving");
  const [scenario, setScenario] = useState("");
  const [outcomeNote, setOutcomeNote] = useState("");
  const [outcome, setOutcome] = useState<"restrain" | "relapse" | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 倒计时
  useEffect(() => {
    if (step !== "countdown") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setStep("chat");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [step]);

  // 呼吸引导循环
  useEffect(() => {
    if (step !== "countdown") return;
    const phase = BREATH_PHASES[breathPhase];
    const t = setTimeout(() => {
      setBreathPhase((p) => (p + 1) % BREATH_PHASES.length);
    }, phase.duration * 1000);
    return () => clearTimeout(t);
  }, [breathPhase, step]);

  const progress = ((COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS) * 100;
  const recentRestrains = events.filter((e) => e.type === "restrain").slice(-3).reverse();

  async function record(o: "restrain" | "relapse") {
    setOutcome(o);
    const rec: Omit<EventRecord, "id" | "timestamp"> = {
      type: o,
      trigger,
      scenario: scenario.trim(),
      outcomeNote: outcomeNote.trim(),
    };
    await addEvent(rec);
    setShowCelebration(true);
    setStep("done");
  }

  function restart() {
    setStep("countdown");
    setSecondsLeft(COUNTDOWN_SECONDS);
    setScenario("");
    setOutcomeNote("");
    setOutcome(null);
  }

  return (
    <>
      <div>
        <PageHeader
          eyebrow="冲动救援站"
          title="深呼吸，你比自己以为的更有力量"
          subtitle="三步把你拉回理智：60 秒冷却呼吸 · AI 即时疏导 · 历史经历复盘。"
        />

        {/* 步骤指示器 */}
        <div className="flex items-center gap-2 mb-7 max-w-md">
          {(["countdown", "chat", "review", "record"] as Step[]).map((s, i) => {
            const order = ["countdown", "chat", "review", "record", "done"];
            const active = order.indexOf(step) === i;
            const passed = order.indexOf(step) > i;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${active || passed ? "bg-dawn-300" : "bg-cream-200"}`} />
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* 步骤 1：冷却倒计时 */}
          {step === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="card p-8 md:p-12 flex flex-col items-center"
            >
              <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center mb-6">
                {/* 进度环 */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(226,217,198,0.5)" strokeWidth="3" />
                  <circle
                    cx="50" cy="50" r="46" fill="none" stroke="#E8B4A0" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - progress / 100)}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                {/* 呼吸圆 */}
                <motion.div
                  className="absolute w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-dawn-200/60 to-sage-200/40"
                  animate={{
                    scale: [0.9, 1.15, 1.15, 0.9],
                  }}
                  transition={{
                    duration: 4 + 7 + 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 4 / 19, (4 + 7) / 19, 1],
                  }}
                />
                <div className="relative z-10 text-center">
                  <p className="font-serif text-5xl md:text-6xl font-bold text-ink-600 tabular-nums">{secondsLeft}</p>
                  <p className="text-sm text-dawn-400 mt-1 tracking-widest">{BREATH_PHASES[breathPhase].label}</p>
                </div>
              </div>

              <p className="text-sm text-ink-500 text-center max-w-sm leading-relaxed mb-6 font-serif">
                跟着节奏呼吸，看着这股冲动<br />它只是经过你的情绪，不是你
              </p>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {TRIGGER_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTrigger(t.value)}
                    className={`chip text-xs ${trigger === t.value ? "bg-dawn-300 text-cream-50" : "bg-cream-100 text-ink-400 hover:bg-cream-200 dark:bg-night-200 dark:text-ink-dark dark:hover:bg-night-300"}`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("chat")} className="btn-ghost">
                  跳过倒计时 <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={restart} className="btn-ghost">
                  <RotateCcw className="w-4 h-4" /> 重置
                </button>
              </div>
            </motion.div>
          )}

          {/* 步骤 2：AI 对话 */}
          {step === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-5 md:p-6"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-cream-200/60">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-dawn-300 to-gold-400 flex items-center justify-center shadow-glow">
                  <MessageCircleHeart className="w-4.5 h-4.5 text-cream-50" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="font-serif font-bold text-ink-600 leading-none">和它聊聊</p>
                  <p className="text-[11px] text-ink-400 mt-1">把此刻的感受说出来，它会陪你</p>
                </div>
              </div>
              <ChatPanel trigger={trigger} compact />
              <div className="flex justify-end mt-4">
                <button onClick={() => setStep("review")} className="btn-primary">
                  看看过去的我 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 步骤 3：历史复盘 */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-sage-400" strokeWidth={1.8} />
                  <p className="font-serif font-bold text-ink-600">你曾经做到过</p>
                </div>
                {recentRestrains.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-8 h-8 text-cream-300 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-sm text-ink-400">这会是你的第一次克制记录，<br />未来的你会感谢此刻的你</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRestrains.map((e) => (
                      <div key={e.id} className="rounded-2xl bg-sage-100/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="chip text-xs bg-sage-200/60 text-sage-500">{TRIGGER_LABELS[e.trigger]}</span>
                          <span className="text-xs text-ink-400 ml-auto">
                            {new Date(e.timestamp).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
                          </span>
                        </div>
                        {e.scenario && <p className="text-sm text-ink-600 mb-2">{e.scenario}</p>}
                        {e.outcomeNote && (
                          <p className="text-xs text-sage-500 italic">「{e.outcomeNote}」</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button onClick={() => setStep("record")} className="btn-primary">
                  做出选择 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 步骤 4：记录结果 */}
          {step === "record" && (
            <motion.div
              key="record"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="card p-6 md:p-8"
            >
              <p className="font-serif text-xl font-bold text-ink-600 mb-1">此刻的你，做出了什么选择？</p>
              <p className="text-sm text-ink-400 mb-6">如实记录——不批判，只为下一次更清楚自己</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs text-ink-400 mb-1.5 block">当时的场景（可选）</label>
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="例如：深夜一个人加班后，想用吃东西缓解压力…"
                    className="input-soft min-h-[80px] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-400 mb-1.5 block">此刻的感受（可选）</label>
                  <input
                    value={outcomeNote}
                    onChange={(e) => setOutcomeNote(e.target.value)}
                    placeholder="例如：坚持下来后，觉得身体很轻盈"
                    className="input-soft"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => record("restrain")}
                  className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-sage-100/60 hover:bg-sage-200/70 border border-sage-200/50 transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-sage-300 flex items-center justify-center group-hover:scale-110 transition">
                    <Check className="w-6 h-6 text-cream-50" strokeWidth={2} />
                  </div>
                  <span className="font-serif font-bold text-sage-500">克制成功</span>
                  <span className="text-[11px] text-ink-400">又一次善待自己</span>
                </button>
                <button
                  type="button"
                  onClick={() => record("relapse")}
                  className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-dawn-100/60 hover:bg-dawn-200/70 border border-dawn-200/50 transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-dawn-300 flex items-center justify-center group-hover:scale-110 transition">
                    <X className="w-6 h-6 text-cream-50" strokeWidth={2} />
                  </div>
                  <span className="font-serif font-bold text-dawn-400">没扛住</span>
                  <span className="text-[11px] text-ink-400">没关系，记下来</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 完成 */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-10 md:p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-glow ${outcome === "restrain" ? "bg-gradient-to-br from-sage-300 to-sage-400" : "bg-gradient-to-br from-dawn-300 to-dawn-400"}`}
              >
                {outcome === "restrain" ? <Trophy className="w-10 h-10 text-cream-50" strokeWidth={1.8} /> : <Wind className="w-10 h-10 text-cream-50" strokeWidth={1.8} />}
              </motion.div>
              <h2 className="font-serif text-3xl font-bold text-ink-600">
                {outcome === "restrain" ? "你做到了" : "记下了，继续走"}
              </h2>
              <p className="text-ink-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                {outcome === "restrain"
                  ? "这一次的觉察，会变成下一次的本能。每一次善待自己都在积累。"
                  : "自控不是一次定输赢，是反复练习。你愿意记录，就已经在进步了。"}
              </p>
              <div className="flex justify-center gap-3 mt-7">
                <button onClick={() => navigate("/")} className="btn-ghost">回到首页</button>
                <button onClick={() => navigate("/stats")} className="btn-sage">
                  <Sparkles className="w-4 h-4" /> 看看成长
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        type={outcome === "restrain" ? "success" : "relapse"}
      />
    </>
  );
}
