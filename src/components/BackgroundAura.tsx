import { motion } from "framer-motion";

// 柔和的浮动光斑背景，营造静谧氛围
export default function BackgroundAura() {
  const blobs = [
    { cx: "12%", cy: "18%", r: 280, color: "rgba(232, 180, 160, 0.22)", delay: 0 },
    { cx: "85%", cy: "25%", r: 240, color: "rgba(155, 143, 168, 0.18)", delay: 2 },
    { cx: "70%", cy: "88%", r: 300, color: "rgba(143, 168, 155, 0.2)", delay: 1 },
    { cx: "20%", cy: "80%", r: 220, color: "rgba(212, 184, 150, 0.16)", delay: 3 },
  ];
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {blobs.map((b, i) => (
          <motion.circle
            key={i}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            fill={b.color}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              r: [b.r, b.r + 30, b.r],
            }}
            transition={{
              duration: 12,
              delay: b.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
      {/* 细微粒子 */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={`p-${i}`}
          className="absolute rounded-full bg-gold-300/40"
          style={{
            left: `${(i * 53) % 100}%`,
            top: `${(i * 37) % 100}%`,
            width: 3,
            height: 3,
          }}
          animate={{ y: [0, -24, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{
            duration: 6 + (i % 5),
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
