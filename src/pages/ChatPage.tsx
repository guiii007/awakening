import { motion } from "framer-motion";
import { MessageCircleHeart, Heart } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import PageHeader from "@/components/PageHeader";

export default function ChatPage() {
  return (
    <div>
      <PageHeader
        eyebrow="即时情绪对话"
        title="把它说出来，它就没那么大了"
        subtitle="欲望上头时，别一个人扛。和 AI 聊聊——它不会评判你，只会陪你把理智拉回来。可按需切换性格：共情、务实或理性。"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card p-5 md:p-6"
      >
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-cream-200/60">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-dawn-300 to-gold-400 flex items-center justify-center shadow-glow">
            <MessageCircleHeart className="w-4.5 h-4.5 text-cream-50" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-serif font-bold text-ink-600 leading-none">觉醒 · 陪伴者</p>
            <p className="text-[11px] text-sage-400 mt-1 flex items-center gap-1">
              <Heart className="w-3 h-3" strokeWidth={1.8} /> 温和 · 包容 · 不批判
            </p>
          </div>
        </div>

        <ChatPanel />
      </motion.div>

      <p className="text-center text-xs text-ink-400/70 mt-5 leading-relaxed">
        对话内容由 AI 模型（DeepSeek）生成，你发送的消息会加密传输至 DeepSeek 服务器以获得回复<br />
        对话记录仅保存在你的本地设备，不会上传到本应用的任何服务器<br />
        如果情绪让你难以承受，请寻求专业心理咨询帮助
      </p>
    </div>
  );
}
