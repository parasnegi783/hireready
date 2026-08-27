"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IconSparkles,
  IconHome,
  IconScan,
  IconPencil,
  IconMicrophone,
  IconBriefcase,
  IconMessageChatbot,
  IconChartBar,
  IconMail,
  IconBuilding,
  IconChevronsLeft,
  IconChevronsRight,
  IconLogout,
  IconDeviceDesktopAnalytics,
} from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { signOut } from "@/lib/supabase";

const studentNavItems = [
  { href: "/dashboard", icon: IconHome, label: "Dashboard" },
  { href: "/dashboard/analyze", icon: IconScan, label: "Analyze" },
  { href: "/dashboard/builder", icon: IconPencil, label: "Resume Builder" },
  { href: "/dashboard/interview", icon: IconMicrophone, label: "Interview Prep" },
  { href: "/dashboard/interview/mock", icon: IconDeviceDesktopAnalytics, label: "Mock Interview" },
  { href: "/dashboard/jobs", icon: IconBriefcase, label: "Job Board" },
  { href: "/dashboard/coach", icon: IconMessageChatbot, label: "AI Coach" },
  { href: "/dashboard/cover-letter", icon: IconMail, label: "Cover Letter" },
  { href: "/dashboard/campus", icon: IconBuilding, label: "Campus Drives" },
  { href: "/dashboard/progress", icon: IconChartBar, label: "Progress" },
];

const tpoNavItems = [
  { href: "/dashboard", icon: IconHome, label: "Dashboard" },
  { href: "/dashboard/campus", icon: IconBuilding, label: "Placement Drives" },
  { href: "/dashboard/analyze", icon: IconScan, label: "Analyze" },
  { href: "/dashboard/coach", icon: IconMessageChatbot, label: "AI Coach" },
  { href: "/dashboard/progress", icon: IconChartBar, label: "Analytics" },
];

const bottomItems: typeof studentNavItems = [
  // { href: "/dashboard/guide", icon: IconBook, label: "Writing Guide" },
  // { href: "/dashboard/settings", icon: IconSettings, label: "Settings" },
];

export function Sidebar() {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();
  const { user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initial = displayName[0].toUpperCase();
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const userRole = (user?.user_metadata?.role as string) || "student";
  const navItems = userRole === "tpo" ? tpoNavItems : studentNavItems;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-white/[0.04] bg-[#111118]"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500">
          <IconSparkles size={14} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap text-base font-semibold text-white"
            >
              HireReady
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex flex-1 flex-col px-3">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-purple-500/10 to-cyan-500/5 font-medium text-white"
                    : "font-light text-slate-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-purple-500"
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  />
                )}
                <item.icon
                  size={20}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-purple-400" : "text-slate-500 group-hover:text-white"
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom items */}
        <div className="flex flex-col gap-1 border-t border-white/[0.04] pt-3">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-light text-slate-400 transition-all hover:bg-white/[0.04] hover:text-white"
            >
              <item.icon size={20} className="shrink-0 text-slate-500 group-hover:text-white" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>

        {/* User & Collapse */}
        <div className="border-t border-white/[0.04] py-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 text-xs font-medium text-white">
                {initial}
              </div>
            )}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-1 items-center justify-between overflow-hidden"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email ?? ""}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-slate-500 hover:text-white"
                    title="Sign out"
                  >
                    <IconLogout size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs text-slate-600 transition-colors hover:text-slate-400"
          >
            {collapsed ? (
              <IconChevronsRight size={16} />
            ) : (
              <>
                <IconChevronsLeft size={16} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </motion.aside>
  );
}
