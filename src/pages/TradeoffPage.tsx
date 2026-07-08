import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Trash2, Check, X, ArrowRight, History } from "lucide-react";
import { useStore } from "@/lib/store";
import { pickGuide } from "@/lib/aiEngine";
import type { TradeoffNote } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

type Stage = "goal" | "requirements" | "sacrifices" | "review" | "done";

interface Draft {
  longGoal: string;
  requirements: string[];
  sacrifices: string[];
  shortGain: string;
  longReward: string;
}

const EMPTY: Draft = { longGoal: "", requirements: [], sacrifices: [], shortGain: "", longReward: "" };

export default function TradeoffPage() {
  const tradeoffs = useStore((s) => s.tradeoffs);
  const addTradeoff = useStore((s) => s.addTradeoff);
  const deleteTradeoff = useStore((s) => s.deleteTradeoff);

  const [mode, setMode] = useState<"list" | "new">("list");
  const [stage, setStage] = useState<Stage>("goal");
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [tempInput, setTempInput] = useState("");
  const [guide, setGuide] = useState(pickGuide("goal"));

  function startNew() {
    setDraft(EMPTY);
    setStage("goal");
    setTempInput("");
    setGuide(pickGuide("goal"));
    setMode("new");
  }

  function nextFromGoal() {
    if (!draft.longGoal.trim()) return;
    setGuide(pickGuide("requirements"));
    setStage("requirements");
  }

  function addItem(field: "requirements" | "sacrifices") {
    if (!tempInput.trim()) return;
    setDraft((d) => ({ ...d, [field]: [...d[field], tempInput.trim()] }));
    setTempInput("");
  }

  function removeItem(field: "requirements" | "sacrifices", idx: number) {
    setDraft((d) => ({ ...d, [field]: d[field].filter((_, i) => i !== idx) }));
  }

  async function save() {
    await addTradeoff({
      longGoal: draft.longGoal.trim(),
      requirements: draft.requirements,
      sacrifices: draft.sacrifices,
      shortGain: draft.shortGain.trim() || draft.sacrifices[0] || "片刻快感",
      longReward: draft.longReward.trim() || draft.longGoal,
    });
    setGuide(pickGuide("summary"));
    setStage("done");
  }

  function reset() {
    setMode("list");
    setDraft(EMPTY);
  }

  const stageOrder: Stage[] = ["goal", "requirements", "sacrifices", "review"];

  if (mode === "new") {
    return (
      <div>
        <PageHeader
          eyebrow="得失权衡书写"
          title="写下你愿意为之付出什么的未来"
          subtitle="AI 会一步步陪你梳理：长期目标、必备条件、需要舍弃的短期享乐。看清之后，选择才属于你。"
        />

        {/* 进度指示 */}
        <div className="flex items-center gap-2 mb-7">
          {stageOrder.map((s, i) => {
            const currentIdx = stageOrder.indexOf(stage);
            const active = stage === s;
            const passed = currentIdx > i;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${active ? "bg-dawn-400 shadow-[0_0_8px_rgba(215,154,130,0.5)]" : passed ? "bg-dawn-300" : "bg-cream-200"}`} />
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {stage === "goal" && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-6 md:p-8"
            >
              <AiBubble text={guide} />
              <textarea
                autoFocus
                value={draft.longGoal}
                onChange={(e) => setDraft((d) => ({ ...d, longGoal: e.target.value }))}
                placeholder="例如：成为一个能掌控自己、身体健康、专注长期事业的人…"
                className="input-soft mt-5 min-h-[120px] resize-none leading-relaxed"
              />
              <div className="flex justify-end mt-4">
                <button type="button" onClick={nextFromGoal} disabled={!draft.longGoal.trim()} className="btn-primary">
                  下一步 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {stage === "requirements" && (
            <motion.div
              key="req"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-6 md:p-8"
            >
              <AiBubble text={guide} />
              <ListEditor
                items={draft.requirements}
                temp={tempInput}
                setTemp={setTempInput}
                onAdd={() => addItem("requirements")}
                onRemove={(i) => removeItem("requirements", i)}
                placeholder="例如：充沛的精力、自律的作息、清晰的头脑…"
                accent="sage"
              />
              <div className="flex justify-between mt-4">
                <button type="button" onClick={() => { setGuide(pickGuide("goal")); setStage("goal"); }} className="btn-ghost">上一步</button>
                <button type="button" onClick={() => { setGuide(pickGuide("sacrifices")); setStage("sacrifices"); }} disabled={draft.requirements.length === 0} className="btn-primary">
                  下一步 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {stage === "sacrifices" && (
            <motion.div
              key="sac"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-6 md:p-8"
            >
              <AiBubble text={guide} />
              <ListEditor
                items={draft.sacrifices}
                temp={tempInput}
                setTemp={setTempInput}
                onAdd={() => addItem("sacrifices")}
                onRemove={(i) => removeItem("sacrifices", i)}
                placeholder="例如：深夜暴食、刷短视频、过度自慰…"
                accent="dawn"
              />
              <div className="flex justify-between mt-4">
                <button type="button" onClick={() => { setGuide(pickGuide("requirements")); setStage("requirements"); }} className="btn-ghost">上一步</button>
                <button type="button" onClick={() => {
                  if (tempInput.trim()) addItem("sacrifices");
                  setStage("review");
                }} disabled={draft.sacrifices.length === 0 && !tempInput.trim()} className="btn-primary">
                  生成对比清单 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {stage === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <ComparisonCard draft={draft} setDraft={setDraft} />
              <div className="card p-5">
                <p className="text-sm text-ink-500 leading-relaxed font-serif italic">
                  「{guide}」
                </p>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStage("sacrifices")} className="btn-ghost">修改</button>
                <button type="button" onClick={save} className="btn-sage">
                  <Check className="w-4 h-4" /> 存入笔记库
                </button>
              </div>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-sage-400" strokeWidth={2} />
              </motion.div>
              <h3 className="font-serif text-2xl font-bold text-ink-600">已存入笔记库</h3>
              <p className="text-ink-400 mt-2 text-sm max-w-md mx-auto leading-relaxed">{guide}</p>
              <div className="flex justify-center gap-3 mt-6">
                <button type="button" onClick={reset} className="btn-ghost">返回列表</button>
                <button type="button" onClick={startNew} className="btn-primary">再写一份</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="得失权衡书写"
        title="有得必有失，看清才能选对"
        subtitle="把你愿意追求的、和愿意放下的，都摊在桌面上看一眼。"
      />
      <button onClick={startNew} className="btn-primary mb-7">
        <Plus className="w-4 h-4" /> 新建一份权衡
      </button>

      {tradeoffs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {[...tradeoffs].reverse().map((t) => (
            <TradeoffCard key={t.id} note={t} onDelete={() => deleteTradeoff(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AiBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-dawn-300 to-gold-400 flex items-center justify-center shrink-0 shadow-glow">
        <Sparkles className="w-4 h-4 text-cream-50" strokeWidth={1.8} />
      </div>
      <div className="flex-1 bg-cream-100/80 rounded-3xl rounded-tl-md px-4 py-3">
        <p className="text-sm text-ink-600 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ListEditor({
  items, temp, setTemp, onAdd, onRemove, placeholder, accent,
}: {
  items: string[];
  temp: string;
  setTemp: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  placeholder: string;
  accent: "sage" | "dawn";
}) {
  const accentBg = accent === "sage" ? "bg-sage-100 text-sage-500" : "bg-dawn-100 text-dawn-400";
  return (
    <div className="mt-5">
      <div className="flex gap-2">
        <input
          autoFocus
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder={placeholder}
          className="input-soft"
        />
        <button onClick={onAdd} className="btn-ghost shrink-0 px-4">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((it, i) => (
          <motion.div
            key={`${it}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl ${accentBg}`}
          >
            <span className="text-sm">{it}</span>
            <button onClick={() => onRemove(i)} className="opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ComparisonCard({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  return (
    <div className="card p-6 md:p-8">
      <p className="text-xs tracking-widest text-dawn-400 uppercase font-medium mb-1">长期目标</p>
      <p className="font-serif text-xl font-bold text-ink-600 mb-5">{draft.longGoal}</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 左：短暂快感 */}
        <div className="rounded-3xl bg-gradient-to-br from-dawn-100/60 to-cream-50 p-5 border border-dawn-200/40 dark:from-night-200/60 dark:to-night-100/40 dark:border-night-50/20">
          <p className="text-xs tracking-widest text-dawn-400 uppercase font-medium mb-3 dark:text-dawn-300">短暂快感（失）</p>
          <input
            value={draft.shortGain}
            onChange={(e) => setDraft({ ...draft, shortGain: e.target.value })}
            placeholder="一句话描述这份快感…"
            className="w-full bg-transparent text-sm text-ink-600 font-medium focus:outline-none border-b border-dawn-200/40 pb-1.5 mb-3 dark:text-ink-dark dark:border-night-50/30"
          />
          <ul className="space-y-1.5">
            {draft.sacrifices.map((s, i) => (
              <li key={i} className="text-sm text-ink-500 flex items-start gap-1.5 dark:text-ink-dark/70">
                <span className="text-dawn-400 mt-0.5 dark:text-dawn-300">·</span> {s}
              </li>
            ))}
          </ul>
        </div>
        {/* 右：长期收益 */}
        <div className="rounded-3xl bg-gradient-to-br from-sage-100/60 to-cream-50 p-5 border border-sage-200/40 dark:from-night-200/60 dark:to-night-100/40 dark:border-night-50/20">
          <p className="text-xs tracking-widest text-sage-400 uppercase font-medium mb-3 dark:text-sage-300">长期回报（得）</p>
          <input
            value={draft.longReward}
            onChange={(e) => setDraft({ ...draft, longReward: e.target.value })}
            placeholder="一句话描述长期回报…"
            className="w-full bg-transparent text-sm text-ink-600 font-medium focus:outline-none border-b border-sage-200/40 pb-1.5 mb-3 dark:text-ink-dark dark:border-night-50/30"
          />
          <ul className="space-y-1.5">
            {draft.requirements.map((r, i) => (
              <li key={i} className="text-sm text-ink-500 flex items-start gap-1.5 dark:text-ink-dark/70">
                <span className="text-sage-400 mt-0.5 dark:text-sage-300">·</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TradeoffCard({ note, onDelete }: { note: TradeoffNote; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="card card-hover overflow-hidden"
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-ink-400">
              {new Date(note.timestamp).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })}
            </p>
            <p className="font-serif text-lg font-bold text-ink-600 mt-1 line-clamp-1">{note.longGoal}</p>
          </div>
          <ArrowRight className={`w-4 h-4 text-ink-400 transition-transform ${open ? "rotate-90" : ""}`} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 grid md:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-dawn-100/40 p-4">
                <p className="text-xs text-dawn-400 font-medium mb-2">舍（短期享乐）</p>
                <p className="text-sm text-ink-500 mb-2">{note.shortGain}</p>
                <ul className="text-xs text-ink-400 space-y-1">
                  {note.sacrifices.map((s, i) => <li key={i}>· {s}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl bg-sage-100/40 p-4">
                <p className="text-xs text-sage-400 font-medium mb-2">得（长期回报）</p>
                <p className="text-sm text-ink-500 mb-2">{note.longReward}</p>
                <ul className="text-xs text-ink-400 space-y-1">
                  {note.requirements.map((r, i) => <li key={i}>· {r}</li>)}
                </ul>
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <button onClick={onDelete} className="text-xs text-ink-400 hover:text-dawn-400 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <History className="w-10 h-10 text-cream-300 mx-auto mb-3" strokeWidth={1.5} />
      <p className="font-serif text-lg text-ink-500">还没有权衡笔记</p>
      <p className="text-sm text-ink-400 mt-1">写下第一份，让未来的你有据可循</p>
    </div>
  );
}
