import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  // Always start dark (SSR-safe). ThemeProvider hydrates from localStorage on mount.
  theme: "dark",
  setTheme: (t) => {
    if (typeof window !== "undefined") localStorage.setItem("hr-theme", t);
    set({ theme: t });
  },
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") localStorage.setItem("hr-theme", next);
      return { theme: next };
    }),
}));
