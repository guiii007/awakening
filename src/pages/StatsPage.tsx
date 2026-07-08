import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { ChevronDown, TrendingUp, Trophy, Target, Sparkles, Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { TRIGGER_LABELS, TRIGGER_COLORS, type TriggerType, type EventRecord } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import StreakRing from "@/components/StreakRing";

export default function StatsPage() {
  const stats = useStore((s) => s.stats);
  const progress = useStore((s) => s.progress);
  const events = useStore((s) => s.events);

  const pieData = useMemo(
    () => (stats?.triggerDistribution || []).map((t) => ({
      name: TRIGGER_LABELS[t.trigger],
      value: t.count,
      color: TRIGGER_COLORS[t.trigger],
    })),
    [stats],
  );

  const trendData = stats?.trend30 || [];
  const hasData = (events.length > 0);

  return (
    <div>
      <PageHeader
        eyebrow="数据成长面板"
        title="看见自己一点一点变强"
        subtitle="每一次克制、每一次复盘，都在重塑你。数据只属于你，存在本地。"
      />

      {/* 总览卡片 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <StatCard
          icon={Trophy}
          label="克制总数"
          value={stats?.totalRestrain ?? 0}
          color="sage"
          delay={0}
        />
        <StatCard
          icon={Target}
          label="觉察比例"
          value={`${stats?.successRate ?? 0}%`}
          color="dawn"
          delay={0.1}
        />
        <StatCard
          icon={Sparkles}
          label="日签开启"
          value={stats?.dailyQuoteCount ?? 0}
          color="gold"
          delay={0.2}
        />
        <StatCard
          icon={Heart}
          label="累计克制"
          value={stats?.totalRestrain ?? 0}
          color="dusk"
          delay={0.3}
        />
      </section>

      {!hasData ? (
        <div className="card p-16 text-center">
          <TrendingUp className="w-12 h-12 text-cream-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="font-serif text-xl text-ink-500">还没有数据</p>
          <p className="text-sm text-ink-400 mt-1">完成第一次冲动救援后，这里会开始记录你的成长轨迹</p>
        </div>
      ) : (
        <>
          {/* 趋势 + 成功率环 */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card p-6 lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs tracking-widest text-sage-400 uppercase font-medium">近 30 天趋势</p>
                  <h3 className="font-serif text-lg font-bold text-ink-600 mt-0.5">克制 vs 放纵</h3>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-sage-400"><span className="w-2.5 h-2.5 rounded-full bg-sage-300" />克制</span>
                  <span className="flex items-center gap-1.5 text-dawn-400"><span className="w-2.5 h-2.5 rounded-full bg-dawn-300" />放纵</span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="g-sage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8FA89B" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#8FA89B" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="g-dawn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8B4A0" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#E8B4A0" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,217,198,0.4)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B655F" }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#6B655F" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#FBF8F2",
                        border: "1px solid rgba(226,217,198,0.6)",
                        borderRadius: "16px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="relapse" stroke="#E8B4A0" strokeWidth={2} fill="url(#g-dawn)" dot={{ r: 2, fill: "#E8B4A0" }} activeDot={{ r: 5 }} />
                    <Area type="monotone" dataKey="restrain" stroke="#8FA89B" strokeWidth={2.5} fill="url(#g-sage)" dot={{ r: 2.5, fill: "#8FA89B" }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card p-6 flex flex-col items-center justify-center"
            >
              <p className="text-xs tracking-widest text-dawn-400 uppercase font-medium mb-4">觉察比例</p>
              <StreakRing
                value={stats?.successRate ?? 0}
                label={`${stats?.successRate ?? 0}%`}
                sublabel="觉察 / 总事件"
                color="#E8B4A0"
                size={150}
              />
              <p className="text-xs text-ink-400 mt-4 text-center leading-relaxed">
                {stats && stats.successRate >= 60
                  ? "每一次觉察都在积累"
                  : "每一次觉察都算数，慢慢来"}
              </p>
            </motion.div>
          </section>

          {/* 诱因分布 */}
          {pieData.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card p-6 mb-7"
            >
              <p className="text-xs tracking-widest text-dusk-300 uppercase font-medium">情绪诱因分布</p>
              <h3 className="font-serif text-lg font-bold text-ink-600 mt-0.5 mb-5">是什么在触发你的冲动</h3>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="#FBF8F2" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#FBF8F2",
                          border: "1px solid rgba(226,217,198,0.6)",
                          borderRadius: "16px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span className="text-sm text-ink-600 flex-1">{d.name}</span>
                      <span className="text-sm font-bold text-ink-600 tabular-nums">{d.value}</span>
                      <span className="text-xs text-ink-400 w-10 text-right">
                        {Math.round((d.value / (stats?.totalRestrain + (stats?.totalRelapse ?? 0) || 1)) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* 事件流 */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card p-6"
          >
            <p className="text-xs tracking-widest text-sage-400 uppercase font-medium">完整事件流</p>
            <h3 className="font-serif text-lg font-bold text-ink-600 mt-0.5 mb-5">你的每一步</h3>
            <div className="space-y-1">
              {[...events].reverse().slice(0, 30).map((e) => {
                const hasDetail = e.scenario || e.outcomeNote;
                return (
                  <EventRow key={e.id} event={e} hasDetail={!!hasDetail} />
                );
              })}
            </div>
          </motion.section>
        </>
      )}
    </div>
  );
}

function EventRow({ event, hasDetail }: { event: EventRecord; hasDetail: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const typeLabel = event.type === "restrain" ? "克制" : "放纵";
  const typeColor = event.type === "restrain" ? "sage" : "dawn";

  return (
    <div className="border-b border-cream-200/40 last:border-0">
      <button
        onClick={() => hasDetail && setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 py-2.5 text-left ${hasDetail ? "cursor-pointer hover:bg-cream-50/50 -mx-2 px-2 rounded-xl transition" : ""}`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${typeColor === "sage" ? "bg-sage-300" : "bg-dawn-300"}`} />
        <span className="text-xs text-ink-400 w-20 shrink-0 tabular-nums">
          {new Date(event.timestamp).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
        </span>
        <span className="text-sm text-ink-600 flex-1 truncate">{event.scenario || "—"}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${typeColor === "sage" ? "bg-sage-100 text-sage-500" : "bg-dawn-100 text-dawn-400"}`}>
          {typeLabel}
        </span>
        {hasDetail && (
          <ChevronDown
            className={`w-4 h-4 text-ink-300 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>
      <AnimatePresence>
        {expanded && hasDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-5 mb-3 pl-4 border-l-2 border-cream-200/60 space-y-2.5">
              {event.scenario && (
                <div>
                  <p className="text-[11px] text-ink-400 mb-1">当时的场景</p>
                  <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{event.scenario}</p>
                </div>
              )}
              {event.outcomeNote && (
                <div>
                  <p className="text-[11px] text-ink-400 mb-1">那时的感受</p>
                  <p className="text-sm text-ink-500 leading-relaxed whitespace-pre-wrap">{event.outcomeNote}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color, delay,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  color: "sage" | "dawn" | "gold" | "dusk";
  delay: number;
}) {
  const colorMap = {
    sage: { bg: "bg-sage-100", text: "text-sage-400" },
    dawn: { bg: "bg-dawn-100", text: "text-dawn-400" },
    gold: { bg: "bg-gold-300/40", text: "text-gold-500" },
    dusk: { bg: "bg-dusk-100", text: "text-dusk-300" },
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-5"
    >
      <div className={`w-9 h-9 rounded-xl ${colorMap[color].bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4.5 h-4.5 ${colorMap[color].text}`} strokeWidth={1.8} />
      </div>
      <p className="font-serif text-2xl font-bold text-ink-600 tabular-nums">{value}</p>
      <p className="text-xs text-ink-400 mt-0.5">{label}</p>
    </motion.div>
  );
}
