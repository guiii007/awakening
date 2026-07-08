import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LifeBuoy, Scale, Sparkles, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { TRIGGER_LABELS } from "@/lib/types";
import StreakRing from "@/components/StreakRing";
import DailyQuoteCard from "@/components/DailyQuoteCard";

export default function HomePage() {
  const navigate = useNavigate();
  const progress = useStore((s) => s.progress);
  const stats = useStore((s) => s.stats);
  const tradeoffs = useStore((s) => s.tradeoffs);
  const events = useStore((s) => s.events);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? "夜深了" : hour < 12 ? "早安" : hour < 18 ? "午安" : "晚上好";
  const todayRestrain = events.filter((e) => {
    const d = new Date(e.timestamp);
    const now = new Date();
    return e.type === "restrain" && d.toDateString() === now.toDateString();
  }).length;

  const recentTradeoff = tradeoffs[tradeoffs.length - 1];
  const weekRate = stats?.successRate ?? 0;

  return (
    <div className="space-y-10">
      {/* 顶部问候 + 每日一句 */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm text-ink-400">{greeting}，欢迎回来</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink-600 mt-1 text-balance">
          此刻的你，<br className="md:hidden" />愿意为长期的自己停下吗？
        </h1>
        <div className="mt-5 flex items-start gap-3 card p-5 max-w-2xl">
          <Sparkles className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" strokeWidth={1.8} />
          <p className="text-sm text-ink-500 leading-relaxed font-serif italic">
            "每一次觉察，都是对自己温柔的提醒。"
          </p>
        </div>
      </motion.section>

      {/* 状态总览 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card card-hover p-6 flex items-center gap-5"
        >
          <StreakRing
            value={Math.min(100, (progress?.currentStreak ?? 0) * 10)}
            label={`${progress?.currentStreak ?? 0}`}
            sublabel="觉察天数"
            color="#DD9A82"
            size={104}
          />
          <div>
            <p className="text-xs tracking-widest text-dawn-400 font-medium uppercase">连续觉察</p>
            <p className="font-serif text-xl font-bold text-ink-600 mt-1">每天都在停下来</p>
            <p className="text-xs text-ink-400 mt-1.5">
              每一次停下来看看自己，都是一种练习
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card card-hover p-6"
        >
          <p className="text-xs tracking-widest text-sage-400 font-medium uppercase">今日克制</p>
          <p className="font-serif text-5xl font-bold text-ink-600 mt-2">{todayRestrain}</p>
          <p className="text-xs text-ink-400 mt-2">每一次停下，都是一次胜利</p>
          <div className="mt-4 flex gap-2">
            <span className="chip bg-sage-100 text-sage-500">克制 {stats?.totalRestrain ?? 0}</span>
            <span className="chip bg-dawn-100 text-dawn-400">放纵 {stats?.totalRelapse ?? 0}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card card-hover p-6"
        >
          <p className="text-xs tracking-widest text-dusk-300 font-medium uppercase">觉察比例</p>
          <p className="font-serif text-5xl font-bold text-ink-600 mt-2">{weekRate}<span className="text-2xl text-ink-400">%</span></p>
          <p className="text-xs text-ink-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-sage-400" strokeWidth={1.8} />
            每一次觉察都在积累
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-cream-200 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sage-300 to-dusk-300"
              initial={{ width: 0 }}
              animate={{ width: `${weekRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </section>

      {/* 快捷救援入口 */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative card overflow-hidden p-8 md:p-12 text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dawn-100/40 via-cream-50/0 to-dusk-100/40 pointer-events-none" />
        <div className="relative">
          <p className="text-xs tracking-[0.3em] text-dawn-400 font-medium uppercase mb-3">冲动上头时</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink-600 text-balance">
            别跟着本能跑，先按下这个按钮
          </h2>
          <p className="text-ink-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
            60 秒冷却呼吸 · AI 即时疏导 · 历史经历复盘，三步把你拉回理智
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/rescue")}
            className="relative mt-7 w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-dawn-300 to-dawn-400 text-cream-50 shadow-glow flex flex-col items-center justify-center gap-1.5"
          >
            <span className="absolute inset-0 rounded-full bg-dawn-300/50 animate-breath" />
            <LifeBuoy className="w-9 h-9 relative z-10" strokeWidth={1.6} />
            <span className="relative z-10 font-serif font-bold text-lg">我快失控了</span>
            <span className="relative z-10 text-[11px] opacity-80">点这里</span>
          </motion.button>
        </div>
      </motion.section>

      {/* 快捷入口 + 日签 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DailyQuoteCard />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-ink-600">最近的权衡</h3>
            {tradeoffs.length > 0 && (
              <button onClick={() => navigate("/tradeoff")} className="text-xs text-dawn-400 hover:underline">
                查看全部
              </button>
            )}
          </div>
          {recentTradeoff ? (
            <button
              onClick={() => navigate("/tradeoff")}
              className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-cream-100/80 to-dawn-100/30 border border-cream-200/60 hover:shadow-softer transition group dark:from-night-50/80 dark:to-night-50/40 dark:border-night-50/30"
            >
              <p className="text-[11px] tracking-widest text-dawn-400 uppercase font-medium mb-1.5">长期目标</p>
              <p className="font-serif text-base font-bold text-ink-600 leading-snug line-clamp-2">{recentTradeoff.longGoal}</p>
              <div className="mt-3 flex items-start gap-2 text-xs text-ink-400">
                <span className="chip bg-dawn-100/70 text-dawn-400 text-[11px] py-1">舍：{recentTradeoff.sacrifices[0] || "—"}</span>
              </div>
              <p className="mt-3 text-xs text-ink-400 italic">「{recentTradeoff.longReward}」</p>
            </button>
          ) : (
            <div className="text-center py-8">
              <Scale className="w-8 h-8 text-cream-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-ink-400">还没有权衡笔记</p>
              <button onClick={() => navigate("/tradeoff")} className="btn-ghost mt-4 text-sm">
                写第一份
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* 最近事件流 */}
      {events.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-ink-600">最近的事件</h3>
            <button onClick={() => navigate("/stats")} className="text-xs text-dawn-400 hover:underline">
              成长面板
            </button>
          </div>
          <div className="space-y-2">
            {events.slice(-4).reverse().map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream-100/60 transition">
                <span className={`w-2 h-2 rounded-full ${e.type === "restrain" ? "bg-sage-300" : "bg-dawn-300"}`} />
                <span className="text-xs text-ink-400 w-16 shrink-0">
                  {new Date(e.timestamp).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
                </span>
                <span className="text-sm text-ink-600 flex-1 truncate">{e.scenario || TRIGGER_LABELS[e.trigger]}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${e.type === "restrain" ? "bg-sage-100 text-sage-500" : "bg-dawn-100 text-dawn-400"}`}>
                  {e.type === "restrain" ? "克制" : "放纵"}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
