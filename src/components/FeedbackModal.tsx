import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, MessageCircleHeart, Image, Trash2, Mail } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

type FeedbackType = "bug" | "suggestion" | "praise" | "other";

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeLabels: Record<FeedbackType, string> = {
    bug: "遇到问题",
    suggestion: "功能建议",
    praise: "夸夸作者",
    other: "其他",
  };

  const feedbackEmail = "2575310966@qq.com";

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length && images.length < 3; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert("图片不能超过 5MB");
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function generateTextContent() {
    const lines = [
      `【反馈类型】${typeLabels[type]}`,
      "",
      `【反馈内容】`,
      content,
      "",
      `【联系方式】${contact || "（未填写）"}`,
      "",
      `【发送时间】${new Date().toLocaleString("zh-CN")}`,
      `【图片说明】共 ${images.length} 张图片（请随邮件一并发送）`,
    ];
    return lines.join("\n");
  }

  async function copyToClipboard(text: string, setCopiedState: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    }
  }

  function handleCopyContent() {
    const text = generateTextContent();
    const imageInfo = images.length > 0 ? `\n\n图片请作为附件添加到邮件中（${images.length} 张）` : "";
    copyToClipboard(text + imageInfo, setCopied);
  }

  function handleCopyEmail() {
    copyToClipboard(feedbackEmail, setEmailCopied);
  }

  function handleClose() {
    setContent("");
    setContact("");
    setType("suggestion");
    setImages([]);
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
            className="relative w-full max-w-md card p-6 bg-gradient-to-br from-cream-50 to-cream-100 dark:from-night-200 dark:to-night-100 dark:border-night-50/30 shadow-soft max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-200/60 dark:hover:bg-night-50/30 transition z-10"
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
                  添加图片 <span className="text-ink-300 text-xs">（可选，最多3张）</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-cream-300 dark:border-night-50/40 flex items-center justify-center hover:border-dawn-300 transition"
                  >
                    <Image className="w-5 h-5 text-ink-300" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {images.map((img, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden">
                      <img src={img} alt={`图片 ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink-600/80 flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-300 mt-1">每张图片不超过 5MB</p>
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

              <button
                onClick={handleCopyContent}
                disabled={!content.trim()}
                className="btn-sage w-full disabled:opacity-40"
              >
                {copied ? (
                  <><Check className="w-4 h-4" /> 已复制到剪贴板</>
                ) : (
                  <><Copy className="w-4 h-4" /> 复制反馈内容</>
                )}
              </button>

              <div className="rounded-xl bg-dawn-50/60 dark:bg-dawn-500/10 border border-dawn-200/40 dark:border-dawn-500/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-dawn-400" />
                  <p className="text-sm font-medium text-ink-600 dark:text-ink-dark">
                    请发送到我的邮箱
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-cream-100 dark:bg-night-50/40 text-sm text-ink-600 dark:text-ink-dark font-mono select-all">
                    {feedbackEmail}
                  </code>
                  <button
                    onClick={handleCopyEmail}
                    className="px-3 py-2 rounded-lg bg-cream-100 dark:bg-night-50/40 hover:bg-cream-200/60 dark:hover:bg-night-50/60 transition"
                  >
                    {emailCopied ? (
                      <Check className="w-4 h-4 text-sage-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-ink-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-ink-400 dark:text-ink-dark/60 leading-relaxed">
                  1. 点击上方「复制反馈内容」<br />
                  2. 打开你的邮箱应用，粘贴发送<br />
                  3. 如果有图片，记得作为附件一并发送
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
