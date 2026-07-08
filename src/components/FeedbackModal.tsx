import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Copy, Check, MessageCircleHeart, Image, Trash2, Loader2 } from "lucide-react";

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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeLabels: Record<FeedbackType, string> = {
    bug: "遇到问题",
    suggestion: "功能建议",
    praise: "夸夸作者",
    other: "其他",
  };

  const web3formsAccessKey = "288f8722-227c-4218-8a5d-59e715682706";

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

  async function handleSubmit() {
    if (!content.trim()) return;

    setSending(true);

    const formData = new FormData();
    formData.append("access_key", web3formsAccessKey);
    formData.append("subject", `[觉醒反馈] ${typeLabels[type]}`);
    formData.append("from_name", "觉醒用户");
    formData.append("reply_to", contact || "未填写");

    const message = [
      `【反馈类型】${typeLabels[type]}`,
      "",
      `【反馈内容】`,
      content,
      "",
      `【联系方式】${contact || "（未填写）"}`,
      "",
      `【发送时间】${new Date().toLocaleString("zh-CN")}`,
      `【图片数量】${images.length}`,
    ].join("\n");
    formData.append("message", message);

    images.forEach((img, index) => {
      const base64Data = img.split(",")[1];
      const mimeType = img.split(",")[0].split(":")[1].split(";")[0];
      const ext = mimeType.split("/")[1];
      const blob = base64ToBlob(base64Data, mimeType);
      formData.append(`file_${index + 1}`, blob, `feedback_${index + 1}.${ext}`);
    });

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSent(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        alert("发送失败，请重试或使用复制功能");
      }
    } catch {
      alert("网络错误，请重试或使用复制功能");
    } finally {
      setSending(false);
    }
  }

  function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
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
      `【图片数量】${images.length}`,
    ];
    return lines.join("\n");
  }

  async function handleCopy() {
    const text = generateTextContent();
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
    setImages([]);
    setSent(false);
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

            {sent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-sage-100 dark:bg-sage-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-sage-400 dark:text-sage-300" />
                </div>
                <p className="font-serif text-xl font-bold text-ink-600 dark:text-ink-dark mb-2">
                  发送成功！
                </p>
                <p className="text-sm text-ink-400 dark:text-ink-dark/60">
                  谢谢你的反馈，我会认真看的
                </p>
              </motion.div>
            ) : (
              <>
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
                    <div className="flex gap-2">
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
                      onClick={handleSubmit}
                      disabled={!content.trim() || sending}
                      className="btn-sage disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> 发送中
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> 发送反馈
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-ink-300 text-center">
                    你的反馈会直接发送到我的邮箱
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
