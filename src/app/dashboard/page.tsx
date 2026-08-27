"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { supabase } from "@/lib/supabase";
import {
  IconScan,
  IconPencil,
  IconMicrophone,
  IconBriefcase,
  IconMessageChatbot,
  IconChartBar,
  IconSparkles,
  IconTrendingUp,
  IconClipboardCheck,
  IconFlame,
} from "@tabler/icons-react";

const quickActions = [
  { href: "/dashboard/analyze", icon: IconScan, title: "Analyze Resume", desc: "Upload & match against a JD", gradient: "from-purple-600 to-purple-400" },
  { href: "/dashboard/builder", icon: IconPencil, title: "Build Resume", desc: "Create with templates", gradient: "from-cyan-600 to-cyan-400" },
  { href: "/dashboard/interview", icon: IconMicrophone, title: "Interview Prep", desc: "Practice with AI", gradient: "from-emerald-600 to-emerald-400" },
  { href: "/dashboard/coach", icon: IconMessageChatbot, title: "AI Coach", desc: "Get career guidance", gradient: "from-amber-600 to-amber-400" },
  { href: "/dashboard/jobs", icon: IconBriefcase, title: "Find Jobs", desc: "Auto-matched listings", gradient: "from-rose-600 to-rose-400" },
  { href: "/dashboard/progress", icon: IconChartBar, title: "Track Progress", desc: "View your improvement", gradient: "from-indigo-600 to-indigo-400" },
];

interface AnalysisRow {
  match_score: number;
  ats_score: number;
  created_at: string;
  job_description: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there").split(" ")[0];

  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [recent, setRecent] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    supabase
      .from("analyses")
      .select("match_score, ats_score, created_at, job_description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLoading(false);
        if (!data || data.length === 0) return;
        setTotalAnalyses(data.length);
        setBestScore(Math.max(...data.map((d) => d.match_score)));
        setRecent(data.slice(0, 5));

        // Calculate streak (consecutive days with analyses, ending today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = new Set(data.map((d) => {
          const dt = new Date(d.created_at);
          dt.setHours(0, 0, 0, 0);
          return dt.getTime();
        }));
        let s = 0;
        const oneDay = 86400000;
        for (let d = today.getTime(); days.has(d); d -= oneDay) s++;
        setStreak(s || (data.length > 0 ? 1 : 0));
      });
  }, [user?.id]);

  const stats = [
    { icon: IconClipboardCheck, label: "Analyses", value: String(totalAnalyses), color: "text-purple-400" },
    { icon: IconTrendingUp, label: "Best Score", value: bestScore !== null ? `${bestScore}%` : "--", color: "text-cyan-400" },
    { icon: IconFlame, label: "Day Streak", value: String(streak || 1), color: "text-amber-400" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back<span className="gradient-text">,</span>{" "}
          <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          Ready to get hire-ready? Pick where you left off.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 grid grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#111118]" />
          ))
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111118] p-5">
              <div className={stat.color}><stat.icon size={22} /></div>
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs font-light text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {quickActions.map((action, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
              <Link href={action.href} className="group flex flex-col rounded-2xl border border-white/[0.06] bg-[#111118] p-5 transition-all duration-300 hover:border-purple-500/20 hover:shadow-[0_8px_32px_rgba(124,58,237,0.08)]">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]`}>
                  <action.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white">{action.title}</h3>
                <p className="mt-1 text-xs font-light text-slate-500">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
        {recent.length > 0 ? (
          <>
            <h2 className="mb-4 text-lg font-semibold">Recent Analyses</h2>
            <div className="flex flex-col gap-2">
              {recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#111118] px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {r.job_description?.substring(0, 60) || "Analysis"}...
                    </p>
                    <p className="text-xs text-slate-600">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${r.match_score >= 70 ? "text-emerald-400" : r.match_score >= 40 ? "text-amber-400" : "text-rose-400"}`}>
                        {r.match_score}%
                      </p>
                      <p className="text-[10px] text-slate-600">match</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${r.ats_score >= 70 ? "text-emerald-400" : r.ats_score >= 40 ? "text-amber-400" : "text-rose-400"}`}>
                        {r.ats_score}%
                      </p>
                      <p className="text-[10px] text-slate-600">ATS</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
              <IconSparkles size={24} className="text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-white">No activity yet</h3>
            <p className="mt-1.5 max-w-xs text-sm font-light text-slate-500">
              Start by uploading your resume and analyzing it against a job description.
            </p>
            <Link href="/dashboard/analyze" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)]">
              <IconScan size={16} />
              Analyze Your Resume
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
