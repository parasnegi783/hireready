"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IconSparkles, IconBuilding } from "@tabler/icons-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-36 text-center">
      {/* Gradient mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.06) 40%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-amber-400"
        >
          Start today
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Your moment is coming.
          <br />
          <span className="gradient-text italic">Be ready for it.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-5 max-w-md text-base font-light text-slate-400"
        >
          Whether you&apos;re a student landing your first offer or a college
          running 50 placement drives — HireReady has you covered.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 px-8 py-4 text-base font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(124,58,237,0.35)]"
          >
            <IconSparkles size={18} />
            Try Free as Student
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
          <Link
            href="/login?role=tpo"
            className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-4 text-sm font-light text-slate-300 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.04]"
          >
            <IconBuilding size={16} />
            Set up my College
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xs font-light text-slate-600"
        >
          Students: free forever &middot; Pro ₹299/mo &nbsp;|&nbsp; Colleges:
          Campus plans from ₹50K/year
        </motion.p>
      </div>
    </section>
  );
}
