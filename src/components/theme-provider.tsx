"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore();

  // On first client mount, read saved preference and sync store + html attribute
  useEffect(() => {
    const saved = localStorage.getItem("hr-theme") as "dark" | "light" | null;
    const resolved = saved || "dark";
    if (resolved !== theme) setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep html attribute in sync on every theme change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
