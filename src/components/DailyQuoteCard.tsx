import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, RefreshCw } from "lucide-react";
import { generateAIQuote, getImageUrl, type DailyQuote } from "@/data/dailyQuotes";
import { useStore } from "@/lib/store";

export default function DailyQuoteCard() {
  const incrementCount = useStore((s) => s.incrementDailyQuoteCount);
  const [show, setShow] = useState(false);
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 确保最少加载 2 秒，给 AI 足够的缓冲时间
  async function withMinDelay<T>(fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    const result = await fn();
    const elapsed = Date.now() - start;
    if (elapsed < 2000) {
      await new Promise((r) => setTimeout(r, 2000 - elapsed));
    }
    return result;
  }

  async function openQuote() {
    setLoading(true);
    setImageLoading(true);
    setImageError(false);
    setShow(true);
    try {
      const q = await withMinDelay(() => generateAIQuote());
      setQuote(q);
      await incrementCount();
    } catch {
      // generateAIQuote 内部已有兜底
    }
    setLoading(false);
  }

  async function refreshQuote() {
    if (loading) return;
    setLoading(true);
    setImageLoading(true);
    setImageError(false);
    try {
      const q = await withMinDelay(() => generateAIQuote());
      setQuote(q);
    } catch {
      // generateAIQuote 内部已有兜底
    }
    setLoading(false);
  }

  function handleImageLoad() {
    setImageLoading(false);
  }

  function handleImageError() {
    setImageLoading(false);
    setImageError(true);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="font-serif text-lg font-bold text-ink-600 mb-4 dark:text-ink-dark">今日日签</h3>
        <button
          onClick={openQuote}
          className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-r from-dawn-100/60 to-sage-100/60 hover:from-dawn-200/70 hover:to-sage-200/70 border border-dawn-200/30 transition group dark:from-night-50/70 dark:to-night-50/50 dark:hover:from-night-50/90 dark:hover:to-night-50/70 dark:border-night-50/40"
        >
          <div className="w-12 h-12 rounded-full bg-dawn-200 flex items-center justify-center group-hover:scale-110 transition">
            <Sparkles className="w-6 h-6 text-dawn-500" strokeWidth={1.8} />
          </div>
          <div className="text-left">
            <p className="font-serif font-bold text-ink-600 dark:text-ink-dark">抽取一张日签</p>
            <p className="text-xs text-ink-400 mt-0.5 dark:text-ink-dark/60">随机获得一张图片和一段温暖的话</p>
          </div>
        </button>
      </motion.div>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setShow(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-cream-50 rounded-3xl overflow-hidden shadow-2xl dark:bg-night-200"
            >
              <div className="relative aspect-video bg-cream-100">
                <AnimatePresence mode="wait">
                  {loading || imageLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-8 h-8 text-dawn-400 animate-spin" />
                      <p className="text-xs text-ink-400">图片生成中，请稍候...</p>
                    </motion.div>
                  ) : imageError ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
                    >
                      <p className="text-sm text-ink-400">图片加载失败</p>
                      <p className="text-xs text-ink-300">日签内容已生成，图片暂时无法加载</p>
                    </motion.div>
                  ) : quote ? (
                    <motion.img
                      key={quote.id}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      src={getImageUrl(quote.imagePrompt)}
                      alt={quote.title}
                      className="w-full h-full object-cover"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : null}
                </AnimatePresence>
                <button
                  onClick={() => setShow(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ink-900/30 hover:bg-ink-900/50 flex items-center justify-center backdrop-blur-sm transition"
                >
                  <X className="w-4 h-4 text-cream-50" strokeWidth={2} />
                </button>
                <button
                  onClick={refreshQuote}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-ink-900/30 hover:bg-ink-900/50 flex items-center justify-center backdrop-blur-sm transition"
                >
                  <RefreshCw className={`w-4 h-4 text-cream-50 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="p-6">
                {quote ? (
                  <>
                    <p className="text-xs tracking-widest text-dawn-400 font-medium uppercase mb-2">
                      {quote.title}
                    </p>
                    <p className="font-serif text-lg text-ink-600 leading-relaxed mb-4 dark:text-ink-dark">
                      {quote.quote}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-ink-400 dark:text-ink-dark/60">—— {quote.author}</p>
                      <button
                        onClick={refreshQuote}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-xs text-dawn-400 hover:text-dawn-500 transition disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                        换一张
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 text-dawn-400 animate-spin mr-2" />
                    <p className="text-sm text-ink-400">AI 正在为你生成日签...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}