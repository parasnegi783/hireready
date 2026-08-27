"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  IconShieldCheck,
  IconUsersGroup,
  IconChartBar,
  IconCalendarEvent,
  IconBuildingBank,
  IconSparkles,
} from "@tabler/icons-react";

const campusFeatures = [
  {
    icon: IconShieldCheck,
    title: "AI Proctored Interviews",
    desc: "Conduct real interviews at scale. AI generates role-specific questions, evaluates answers, detects tab-switches and copy-paste, and delivers a full candidate report with a score and recommendation.",
    tag: "The differentiator",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: IconCalendarEvent,
    title: "Placement Drive Management",
    desc: "Create drives with company details, JD, eligibility criteria (CGPA, branch, batch year), and deadline. Students see only the drives they're eligible for — automatically.",
    tag: "TPO dashboard",
    tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: IconUsersGroup,
    title: "Student Pipeline",
    desc: "Track every application through Applied → Shortlisted → Interview → Selected → Rejected. Bulk-shortlist, filter by score, and export results as CSV for the company.",
    tag: "Kanban tracking",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: IconChartBar,
    title: "Placement Analytics",
    desc: "Real-time stats: total placed, average package, company-wise breakdown, branch-wise analysis. Share a placement brochure with incoming companies.",
    tag: "Data-driven",
    tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: IconBuildingBank,
    title: "Admissions Interviews",
    desc: "Same proctored interview system, different use case. Evaluate applicants on motivation, domain aptitude, and communication. Auto-shortlist above a threshold score.",
    tag: "Bonus feature",
    tagColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
];

export function CampusSection() {
  return (
    <section id="campus" className="relative overflow-hidden bg-[#0d0d14] py-32">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-cyan-400"
          >
            For Colleges &amp; Placement Cells
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Run placements with{" "}
            <span className="gradient-text">AI, not Excel.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-lg text-base font-light text-slate-400"
          >
            The only platform that combines placement drive management, AI
            proctored interviews, and student career preparation — all in one.
            No Mettl. No spreadsheets. No chaos.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {campusFeatures.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`group rounded-2xl border border-white/[0.06] bg-[#111118] p-6 transition-all duration-300 hover:border-purple-500/20 hover:shadow-[0_8px_32px_rgba(124,58,237,0.08)] ${i === 0 ? "lg:col-span-2" : ""}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 text-purple-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]">
                  <f.icon size={22} />
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${f.tagColor}`}>
                  {f.tag}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Pricing callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-sm font-light text-slate-500">
            <span className="font-medium text-white">Campus Basic from ₹50K/year</span>
            {" "}·{" "}
            Campus Pro (with AI Proctored Interviews) from ₹1.5L/year
          </p>
          <Link
            href="/login?role=tpo"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)]"
          >
            <IconSparkles size={15} />
            Set up your college
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
