import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import BackgroundAura from "./BackgroundAura";
import { useStore } from "@/lib/store";

export default function Layout() {
  const init = useStore((s) => s.init);
  const loaded = useStore((s) => s.loaded);
  const [mounted, setMounted] = useState(false);
  const [timeoutFallback, setTimeoutFallback] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimeoutFallback(true), 3000);
    init().finally(() => setMounted(true));
    return () => clearTimeout(t);
  }, [init]);

  if ((!mounted || !loaded) && !timeoutFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundAura />
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-dawn-300 to-gold-400 animate-breath shadow-glow" />
          <p className="font-serif text-ink-400 text-sm tracking-widest">唤醒中…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex grain dark:text-ink-dark">
      <BackgroundAura />
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
