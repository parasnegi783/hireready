"use client";

import { motion } from "framer-motion";
import {
  IconFileText,
  IconSearch,
  IconMessageCircle,
  IconClock,
} from "@tabler/icons-react";

const problems = [
  {
    icon: IconFileText,
    title: "Your resume isn't the problem",
    desc: "You spent hours on it. But it was never optimized for the role. No one told you what was missing.",
  },
  {
    icon: IconSearch,
    title: "Applying everywhere, hearing nothing",
    desc: "The ATS system filters you out before a human sees your name. You never know why.",
  },
  {
    icon: IconMessageCircle,
    title: "No feedback. No guidance.",
    desc: "Career coaches cost thousands. Your college placement cell has 500 students. You're on your own.",
  },
  {
    icon: IconClock,
    title: "Time is running out",
    desc: "Placement season doesn't wait. Every week without traction is a week closer to panic.",
  },
];

export function ProblemSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d14] py-32">
      {/* Background text */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-black text-[18vw] text-white/[0.015] tracking-tight">
        WHY
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-4 flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.15em] text-amber-400"
        >
          <span className="h-px w-6 bg-amber-400" />
          The real problem
        </motion.p>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Problem Cards */}
          <div className="flex flex-col gap-3.5">
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 transition-all duration-300 hover:border-purple-500/20 hover:bg-purple-500/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-5deg] group-hover:bg-purple-500/20">
                  <problem.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {problem.title}
                  </h4>
                  <p className="mt-1 text-[13px] font-light leading-relaxed text-slate-500">
                    {problem.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative px-4 py-8 lg:p-10"
          >
            <span className="pointer-events-none absolute top-4 left-2 select-none font-serif text-[8rem] leading-none text-purple-500/15">
              &ldquo;
            </span>
            <p className="relative z-10 mt-12 font-serif text-xl font-normal leading-relaxed text-white/90 italic sm:text-2xl lg:text-3xl">
              I applied to 60 companies in 3 months and got 4 responses. I had
              no idea what I was doing wrong.
            </p>
            <div className="mt-6 h-0.5 w-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
            <p className="mt-4 text-sm font-light text-amber-400/80">
              — Priya, CSE final year &middot; now at a product startup
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
