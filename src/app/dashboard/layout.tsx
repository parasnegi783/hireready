"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { PageTransition } from "@/components/dashboard/page-transition";
import { IconBell, IconSearch, IconSun, IconMoon } from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { sidebarCollapsed, theme, toggleTheme } = useUIStore();
  const isLight = theme === "light";
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "U";
  const initial = displayName[0].toUpperCase();
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <div
        className="transition-[margin] duration-300"
        style={{ marginLeft: sidebarCollapsed ? 68 : 260 }}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.04] bg-[#0A0A0F]/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <IconSearch size={16} className="text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 bg-transparent text-sm font-light text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9, rotate: 15 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-slate-500 transition-all hover:text-white"
              title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLight ? <IconMoon size={16} /> : <IconSun size={16} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-slate-500 transition-colors hover:text-white">
              <IconBell size={18} />
            </button>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 text-xs font-medium text-white">
                {initial}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="p-8"><PageTransition>{children}</PageTransition></main>
      </div>
    </div>
  );
}
