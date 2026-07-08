import { motion } from "framer-motion";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      {eyebrow && (
        <p className="text-xs tracking-[0.3em] text-dawn-400 font-medium uppercase mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-600 text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="text-ink-400 mt-2 text-sm md:text-base max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
