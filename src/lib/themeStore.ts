import { create } from "zustand";

export type ThemeType = "light" | "dark";

interface ThemeState {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",

  setTheme: (theme) => {
    set({ theme });
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  toggleTheme: () => {
    const current = get().theme;
    get().setTheme(current === "light" ? "dark" : "light");
  },
}));