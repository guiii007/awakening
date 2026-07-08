import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Heart, Star, Sparkles } from "lucide-react";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "relapse";
}

const PARTICLE_COUNT = 50;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100 - 100,
  delay: Math.random() * 2,
  duration: 3 + Math.random() * 2,
  color: ["#E8B4A0", "#6B8E7A", "#F5D76E", "#8E44AD", "#3498DB", "#E74C3C", "#2ECC71", "#F39C12"][Math.floor(Math.random() * 8)],
  size: 6 + Math.random() * 8,
}));

const fireworkColors = ["#E8B4A0", "#6B8E7A", "#F5D76E", "#8E44AD", "#3498DB", "#E74C3C"];

export default function CelebrationModal({ isOpen, onClose, type }: CelebrationModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const successMessages = [
    { title: "太棒了！", subtitle: "你战胜了这一次的冲动", emoji: "🎉", color: "text-sage-500" },
    { title: "做得好！", subtitle: "每一次克制都是成长", emoji: "🌟", color: "text-sage-500" },
    { title: "你真了不起！", subtitle: "坚持下去，你会越来越好", emoji: "💪", color: "text-sage-500" },
    { title: "恭喜你！", subtitle: "又一次选择了更好的自己", emoji: "✨", color: "text-sage-500" },
  ];

  const relapseMessages = [
    { title: "没关系的", subtitle: "认识到就是改变的开始", emoji: "💛", color: "text-dawn-400" },
    { title: "别自责", subtitle: "每个人都会有这样的时刻", emoji: "🤗", color: "text-dawn-400" },
    { title: "你已经很棒了", subtitle: "愿意记录就是勇气", emoji: "❤️", color: "text-dawn-400" },
    { title: "下次会更好", subtitle: "这次的经验会帮到你", emoji: "🌱", color: "text-dawn-400" },
  ];

  const messages = type === "success" ? successMessages : relapseMessages;
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* 烟花粒子 */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`firework-${i}`}
              initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 400],
                y: [0, (Math.random() - 0.5) * 400],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                ease: "easeOut",
              }}
              className="absolute"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: fireworkColors[i % fireworkColors.length] }}
              />
            </motion.div>
          ))}

          {/* 飘落彩带 */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: p.y, x: `${p.x}%`, opacity: 1 }}
              animate={{
                y: "120vh",
                x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 100}%`, `${p.x}%`],
                opacity: [1, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "linear",
              }}
              className="absolute"
              style={{
                width: p.size,
                height: p.size * 3,
                backgroundColor: p.color,
                borderRadius: p.size / 2,
              }}
            />
          ))}

          {/* 星星闪烁 */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`star-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0, 1, 0],
                scale: [0, 1.5, 1, 1.2, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
            </motion.div>
          ))}

          {/* 主内容 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm mx-4"
          >
            {/* 背景卡片 */}
            <div className="rounded-3xl bg-gradient-to-br from-cream-50 to-cream-100 p-8 text-center shadow-glow border-2 border-dawn-200/50 dark:from-night-200 dark:to-night-100 dark:border-night-50/30">
              {/* 顶部装饰 */}
              <div className="flex justify-center gap-2 mb-6">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <PartyPopper className="w-8 h-8 text-dawn-400" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                >
                  <Sparkles className="w-6 h-6 text-gold-400" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                >
                  {type === "success" ? (
                    <Star className="w-8 h-8 text-gold-400" fill="currentColor" />
                  ) : (
                    <Heart className="w-8 h-8 text-dawn-400" fill="currentColor" />
                  )}
                </motion.div>
              </div>

              {/* 主要内容 */}
              <AnimatePresence>
                {showContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Emoji */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      {message.emoji}
                    </motion.div>

                    {/* 标题 */}
                    <motion.h2
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`font-serif text-3xl font-bold mb-2 ${message.color}`}
                    >
                      {message.title}
                    </motion.h2>

                    {/* 副标题 */}
                    <p className="text-ink-500 mb-6 dark:text-ink-dark/90">{message.subtitle}</p>

                    {/* 按钮 */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className={`px-8 py-3 rounded-full font-medium transition ${
                        type === "success"
                          ? "bg-sage-300 text-cream-50 hover:bg-sage-400"
                          : "bg-dawn-300 text-cream-50 hover:bg-dawn-400"
                      }`}
                    >
                      {type === "success" ? "继续加油" : "我知道了"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 底部装饰 */}
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                  className={`w-2 h-2 rounded-full ${
                    type === "success" ? "bg-sage-400" : "bg-dawn-400"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}