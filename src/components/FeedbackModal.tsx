import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Copy, Check, MessageCircleHeart, Mail } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

type FeedbackType = "bug" | "suggestion" | "praise" | "other";

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [copied, setCopied] = useState(false);

  const typeLabels: Record<FeedbackType, string> = {
    bug: "遇到问题",
    suggestion: "功能建议",
    praise: "夸夸作者",
    other: "其他",
  };

  const feedbackEmail = "3314212065@qq.com";

  function generateEmailBody() {
    const lines = [
      `【反馈类型】${typeLabels[type]}`,
      "",
      `【反馈内容】`,
      content,
      "",
      `【联系方式】${contact || "（未填写）"}`,
      "",
      "---",
      `发送时间：${new Date().toLocaleString("zh-CN")}`,
    ];
    return lines.join("\n");
  }

  function handleSendEmail() {
    const subject = encodeURIComponent(`[觉醒反馈] ${typeLabels[type]}`);
    const body = encodeURIComponent(generateEmailBody());
    window.location.href = `mailto:${feedbackEmail}?subject=${subject}&body=${body}`;
  }

  async function handleCopy() {
    const text = generateEmailBody();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    setContent("");
    setContact("");
    setType("suggestion");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-ink-600/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md card p-6 bg-gradient-to-br from-cream-50 to-cream-100 dark:from-night-200 dark:to-night-100 dark:border-night-50/30 shadow-soft"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-200/60 dark:hover:bg-night-50/30 transition"
            >
              <X className="w-4 h-4 text-ink-400" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-dawn-100 flex items-center justify-center dark:bg-night-50/40">
                <MessageCircleHeart className="w-5 h-5 text-dawn-400" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-ink-600 dark:text-ink-dark">
                  你的声音很重要
                </p>
                <p className="text-xs text-ink-400 dark:text-ink-dark/60 mt-0.5">
                  每一条反馈我都会认真看
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-ink-500 dark:text-ink-dark/80 mb-2">反馈类型</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(typeLabels) as FeedbackType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-2 text-xs rounded-xl transition ${
                        type === t
                          ? "bg-dawn-400 text-white shadow-soft"
                          : "bg-cream-100 text-ink-400 hover:bg-cream-200/60 dark:bg-night-50/40 dark:text-ink-dark/60 dark:hover:bg-night-50/60"
                      }`}
                    >
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-ink-500 dark:text-ink-dark/80 mb-2">
                  想说的话 <span className="text-dawn-400">*</span>
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="比如：某个按钮不好用、希望加什么功能、或者只是想说声谢谢..."
                  rows={5}
                  className="input-soft resize-none"
                />
              </div>

              <div>
                <p className="text-sm text-ink-500 dark:text-ink-dark/80 mb-2">
                  联系方式 <span className="text-ink-300 text-xs">（选填）</span>
                </p>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="微信/邮箱，方便我回复你"
                  className="input-soft"
                />
              </div>

              <div className="rounded-xl bg-sage-50/60 dark:bg-night-50/40 p-3 space-y-2">
                <p className="text-xs text-sage-500 dark:text-sage-300 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> 两种发送方式
                </p>
                <p className="text-xs text-ink-400 dark:text-ink-dark/60 leading-relaxed">
                  1. 发邮件：会自动打开邮件客户端<br />
                  2. 复制内容：粘贴到微信/QQ 发给我
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCopy}
                  disabled={!content.trim()}
                  className="btn-ghost disabled:opacity-40"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-sage-400" /> 已复制</>
                  ) : (
                    <><Copy className="w-4 h-4" /> 复制内容</>
                  )}
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={!content.trim()}
                  className="btn-sage disabled:opacity-40"
                >
                  <Send className="w-4 h-4" /> 发邮件
                </button>
              </div>

              <p className="text-xs text-ink-300 text-center pt-1">
                我的邮箱：{feedbackEmail}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
