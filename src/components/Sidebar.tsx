import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Scale,
  MessageCircleHeart,
  History,
  LifeBuoy,
  BarChart3,
  Wind,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "今日觉醒", icon: Home, end: true },
  { to: "/tradeoff", label: "得失权衡", icon: Scale },
  { to: "/chat", label: "即时对话", icon: MessageCircleHeart },
  { to: "/review", label: "经历复盘", icon: History },
  { to: "/rescue", label: "冲动救援", icon: LifeBuoy, highlight: true },
  { to: "/stats", label: "成长面板", icon: BarChart3 },
  { to: "/alternatives", label: "健康替代", icon: Wind },
  { to: "/settings", label: "隐私设置", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-cream-200/60 bg-cream-50/60 backdrop-blur-md px-5 py-7 dark:bg-night-200/60 dark:border-night-50/30">
      <div className="flex items-center gap-2.5 px-2 mb-9">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-dawn-300 to-gold-400 flex items-center justify-center shadow-glow">
          <Sparkles className="w-5 h-5 text-cream-50" strokeWidth={1.8} />
        </div>
        <div>
          <p className="font-serif text-lg font-bold text-ink-600 leading-none">觉醒</p>
          <p className="text-[11px] text-ink-400 tracking-widest mt-0.5">AWAKENING</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map((item) => {
          const active = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={cn(
                "relative group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300",
                active
                  ? "text-ink-600 dark:text-ink-dark"
                  : "text-ink-400 hover:text-ink-600 hover:bg-cream-100/70 dark:hover:bg-night-50/50 dark:text-ink-dark/60 dark:hover:text-ink-dark",
                item.highlight && !active && "text-dawn-400",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-dawn-100/80 to-cream-100/40 border border-dawn-200/50"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="w-[18px] h-[18px] relative z-10" strokeWidth={1.8} />
              <span className="relative z-10">{item.label}</span>
              {item.highlight && (
                <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-dawn-400 animate-breath" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <p className="text-[11px] text-ink-400/70 px-3 leading-relaxed dark:text-ink-dark/40">
        理智不是天生的<br />是一次次在冲动前停下来的练习
      </p>
    </aside>
  );
}
