import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Footprints, Brain, StretchHorizontal, PenLine, X, Play, Pause, RotateCcw } from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Method = "breath" | "walk" | "meditate" | "stretch" | "journal";

const METHODS: { id: Method; title: string; desc: string; icon: typeof Wind; color: string; bg: string }[] = [
  { id: "breath", title: "4-7-8 呼吸法", desc: "吸气 4 秒 · 屏息 7 秒 · 呼气 8 秒，三组就能平复神经", icon: Wind, color: "text-sage-400", bg: "bg-sage-100" },
  { id: "walk", title: "起身散步", desc: "离开当前环境 5 分钟，让身体动起来", icon: Footprints, color: "text-dawn-400", bg: "bg-dawn-100" },
  { id: "meditate", title: "正念冥想", desc: "把注意力放回呼吸，看着念头来去", icon: Brain, color: "text-dusk-300", bg: "bg-dusk-100" },
  { id: "stretch", title: "身体拉伸", desc: "松开紧绷的肩颈，释放身体里的压力", icon: StretchHorizontal, color: "text-gold-500", bg: "bg-gold-300/40" },
  { id: "journal", title: "情绪记录", desc: "把此刻的感受写下来，让它从脑子里出去", icon: PenLine, color: "text-sage-400", bg: "bg-sage-100" },
];

export default function AlternativesPage() {
  const [active, setActive] = useState<Method | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow="健康替代方案"
        title="给身体一个出口，而不是给欲望"
        subtitle="冲动来时，与其对抗，不如把能量导引到对身体有益的事上。选一个开始。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {METHODS.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            onClick={() => setActive(m.id)}
            className="card card-hover p-5 flex items-center gap-4 text-left"
          >
            <div className={`w-14 h-14 rounded-2xl ${m.bg} flex items-center justify-center shrink-0`}>
              <m.icon className={`w-7 h-7 ${m.color}`} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg font-bold text-ink-600">{m.title}</p>
              <p className="text-sm text-ink-400 mt-0.5 leading-relaxed">{m.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && <MethodModal method={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}

function MethodModal({ method, onClose }: { method: Method; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ink-700/40 backdrop-blur-sm flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card p-6 md:p-8 max-w-lg w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-cream-200 flex items-center justify-center">
          <X className="w-4 h-4 text-ink-400" />
        </button>
        {method === "breath" && <BreathGuide />}
        {method === "walk" && <WalkGuide />}
        {method === "meditate" && <MeditateGuide />}
        {method === "stretch" && <StretchGuide />}
        {method === "journal" && <JournalGuide />}
      </motion.div>
    </motion.div>
  );
}

function GuideHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-serif text-2xl font-bold text-ink-600">{title}</h3>
      <p className="text-sm text-ink-400 mt-1">{sub}</p>
    </div>
  );
}

function BreathGuide() {
  const phases = [
    { label: "吸气", duration: 4, scale: 1.3 },
    { label: "屏息", duration: 7, scale: 1.3 },
    { label: "呼气", duration: 8, scale: 0.85 },
  ];
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(phases[0].duration);
  const [running, setRunning] = useState(true);
  const [round, setRound] = useState(1);

  useEffect(() => {
    if (!running) return;
    if (count <= 0) {
      const next = (phase + 1) % phases.length;
      if (next === 0) setRound((r) => r + 1);
      setPhase(next);
      setCount(phases[next].duration);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, running, phase]);

  const current = phases[phase];

  return (
    <div>
      <GuideHeader title="4-7-8 呼吸法" sub="跟着圆圈呼吸，三组即可平复神经" />
      <div className="flex flex-col items-center py-4">
        <div className="relative w-48 h-48 flex items-center justify-center mb-5">
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-sage-200 to-dawn-200"
            animate={{ scale: current.scale }}
            transition={{ duration: current.duration, ease: "easeInOut" }}
          />
          <div className="relative z-10 text-center">
            <p className="font-serif text-3xl font-bold text-ink-600 tabular-nums">{count}</p>
            <p className="text-sm text-sage-400 mt-1">{current.label}</p>
          </div>
        </div>
        <p className="text-xs text-ink-400 mb-4">第 {round} 轮</p>
        <div className="flex gap-2">
          <button onClick={() => setRunning(!running)} className="btn-ghost">
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? "暂停" : "继续"}
          </button>
          <button onClick={() => { setPhase(0); setCount(phases[0].duration); setRound(1); }} className="btn-ghost">
            <RotateCcw className="w-4 h-4" /> 重置
          </button>
        </div>
      </div>
    </div>
  );
}

function WalkGuide() {
  return (
    <div>
      <GuideHeader title="起身散步" sub="离开当前环境，让身体帮你切换状态" />
      <ul className="space-y-3 text-sm text-ink-600 leading-relaxed">
        <li className="flex gap-2"><span className="text-sage-400">1.</span> 站起来，离开你现在所在的位置</li>
        <li className="flex gap-2"><span className="text-sage-400">2.</span> 慢走 5 分钟，注意力放在脚底接触地面的感觉</li>
        <li className="flex gap-2"><span className="text-sage-400">3.</span> 看看窗外的天空或远处的树</li>
        <li className="flex gap-2"><span className="text-sage-400">4.</span> 喝一杯温水</li>
        <li className="flex gap-2"><span className="text-sage-400">5.</span> 回来后，问问自己：那股冲动还在吗？</li>
      </ul>
      <div className="mt-5 rounded-2xl bg-sage-100/40 p-4">
        <p className="text-sm text-ink-500 italic font-serif">身体的移动，会带走脑子里一半的冲动。</p>
      </div>
    </div>
  );
}

function MeditateGuide() {
  const [seconds, setSeconds] = useState(180);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div>
      <GuideHeader title="正念冥想" sub="把注意力放回呼吸，看着念头来去" />
      <div className="flex flex-col items-center py-4">
        <motion.div
          className="w-40 h-40 rounded-full bg-gradient-to-br from-dusk-100 to-cream-100 mb-5 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="font-serif text-4xl font-bold text-dusk-300 tabular-nums">{mm}:{ss}</p>
        </motion.div>
        <p className="text-sm text-ink-400 mb-4 text-center max-w-xs leading-relaxed">
          闭上眼，把注意力放在鼻尖的呼吸上。<br />念头来了，不评判，轻轻把注意力拉回。
        </p>
        <div className="flex gap-2">
          <button onClick={() => setRunning(!running)} className="btn-ghost">
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? "暂停" : "开始"}
          </button>
          <button onClick={() => setSeconds(180)} className="btn-ghost">
            <RotateCcw className="w-4 h-4" /> 重置
          </button>
        </div>
      </div>
    </div>
  );
}

function StretchGuide() {
  const steps = [
    { t: "颈部", d: "缓慢左右转头，每侧停留 5 秒" },
    { t: "肩部", d: "耸肩靠近耳朵，保持 3 秒后放下，重复 5 次" },
    { t: "背部", d: "双手交叉向前推，弓背低头，保持 10 秒" },
    { t: "腰部", d: "站立扭转身体，每侧停留 5 秒" },
    { t: "腿部", d: "前屈摸脚，停留 15 秒，松开紧绷的后链" },
  ];
  return (
    <div>
      <GuideHeader title="身体拉伸" sub="松开紧绷的肌肉，释放身体里的压力" />
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-2xl bg-cream-100/60">
            <div className="w-8 h-8 rounded-full bg-gold-300/40 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-gold-500">{i + 1}</span>
            </div>
            <div>
              <p className="font-medium text-ink-600 text-sm">{s.t}</p>
              <p className="text-xs text-ink-400 mt-0.5">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JournalGuide() {
  const [text, setText] = useState("");
  const prompts = [
    "此刻我身体的感觉是…",
    "这股冲动背后，我真正想要的是…",
    "如果放纵了，十分钟后我会…",
    "如果克制住了，明天的我会…",
  ];
  return (
    <div>
      <GuideHeader title="情绪记录" sub="把它写下来，它就没那么大了" />
      <div className="space-y-2 mb-3">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setText((t) => t + (t ? "\n" : "") + p)}
            className="chip bg-cream-100 text-ink-500 hover:bg-cream-200 text-xs"
          >
            {p}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="把此刻的感受写下来…"
        className="input-soft min-h-[140px] resize-none leading-relaxed"
      />
      <p className="text-xs text-ink-400 mt-2">记录不会被保存，写完即释放。如需留存，请到权衡或救援页记录。</p>
    </div>
  );
}
