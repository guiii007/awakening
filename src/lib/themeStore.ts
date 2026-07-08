import { create } from "zustand";

export type ThemeType = "light" | "dark";

function getStoredTheme(): ThemeType {
  try {
    const saved = localStorage.getItem("awakening-theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  return "light";
}

function applyTheme(theme: ThemeType) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem("awakening-theme", theme);
  } catch {}
}

// 页面加载时立即应用主题，避免闪烁
applyTheme(getStoredTheme());

interface ThemeState {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getStoredTheme(),

  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
  },

  toggleTheme: () => {
    const current = get().theme;
    get().setTheme(current === "light" ? "dark" : "light");
  },
}));