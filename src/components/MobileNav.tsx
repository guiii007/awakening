import { NavLink, useLocation } from "react-router-dom";
import { Home, Scale, MessageCircleHeart, LifeBuoy, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "觉醒", icon: Home, end: true },
  { to: "/tradeoff", label: "权衡", icon: Scale },
  { to: "/chat", label: "对话", icon: MessageCircleHeart },
  { to: "/rescue", label: "救援", icon: LifeBuoy, highlight: true },
  { to: "/stats", label: "成长", icon: BarChart3 },
  { to: "/settings", label: "设置", icon: Settings },
];

export default function MobileNav() {
  const location = useLocation();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream-50/90 backdrop-blur-xl border-t border-cream-200/70 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] dark:bg-night-200/90 dark:border-night-50/30">
      <div className="flex items-center justify-around">
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
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all",
                active ? "text-dawn-400" : "text-ink-400 dark:text-ink-dark/60",
                item.highlight && !active && "text-dawn-400",
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
