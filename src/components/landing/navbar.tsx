"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  IconMenu2,
  IconX,
  IconSparkles,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useUIStore } from "@/store/ui-store";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Stories" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useUIStore();
  const isLight = theme === "light";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 lg:px-12",
          scrolled &&
            "bg-[#0A0A0F]/80 shadow-[0_1px_0_rgba(148,163,184,0.06)] backdrop-blur-xl"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-5deg]">
            <IconSparkles size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white">HireReady</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-sm font-light text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li>
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9, rotate: 15 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 transition-colors hover:text-white"
              title={isLight ? "Dark mode" : "Light mode"}
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
          </li>
          <li>
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)]"
            >
              Get Started Free
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 transition-colors hover:text-white md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <IconMenu2 size={20} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#111118] border-l border-white/[0.06] p-6"
            >
              <button
                className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <IconX size={20} />
              </button>
              <ul className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="block rounded-xl px-4 py-3 text-base font-light text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li className="mt-4">
                  <Link
                    href="/login"
                    className="block w-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 py-3 text-center text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started Free &rarr;
                  </Link>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
