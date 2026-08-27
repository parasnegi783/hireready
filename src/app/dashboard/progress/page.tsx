"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconChartBar,
  IconTrendingUp,
  IconTarget,
  IconCalendar,
  IconSparkles,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";

interface AnalysisRow {
  match_score: number;
  ats_score: number;
  created_at: string;
  job_description: string;
}

export default function ProgressPage() {
  const { user } = useAuthStore();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    supabase
      .from("analyses")
      .select("match_score, ats_score, created_at, job_description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setAnalyses(data || []);
        setLoading(false);
      });
  }, [user?.id]);

  const total = analyses.length;
  const avgScore = total ? Math.round(analyses.reduce((s, a) => s + a.match_score, 0) / total) : 0;
  const bestScore = total ? Math.max(...analyses.map((a) => a.match_score)) : 0;
  const activeDays = new Set(analyses.map((a) => new Date(a.created_at).toDateString())).size;

  const chartData = analyses.map((a, i) => ({
    name: `#${i + 1}`,
    match: a.match_score,
    ats: a.ats_score,
    date: new Date(a.created_at).toLocaleDateString(),
  }));

  const stats = [
    { icon: IconChartBar, label: "Total Analyses", value: String(total), color: "text-purple-400" },
    { icon: IconTrendingUp, label: "Avg Score", value: total ? `${avgScore}%` : "--", color: "text-cyan-400" },
    { icon: IconTarget, label: "Best Score", value: total ? `${bestScore}%` : "--", color: "text-emerald-400" },
    { icon: IconCalendar, label: "Active Days", value: String(activeDays || 1), color: "text-amber-400" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Progress <span className="gradient-text">Tracker</span>
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          Track your improvement over time.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-2xl border border-white/[0.06] bg-[#111118] p-5"
          >
            <stat.icon size={20} className={stat.color} />
            <p className="mt-3 text-3xl font-black text-white">{stat.value}</p>
            <p className="mt-0.5 text-xs font-light text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-2xl border border-white/[0.06] bg-[#111118] p-6"
      >
        <h3 className="mb-4 text-base font-semibold">Score History</h3>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-600">Loading...</div>
        ) : chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm font-light text-slate-500">
            Complete your first analysis to start tracking progress
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, fontSize: 13 }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#f8fafc" }}
                formatter={(value) => [`${value}%`]}
                labelFormatter={(_, payload) => payload[0]?.payload?.date || ""}
              />
              <Line type="monotone" dataKey="match" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: "#7C3AED" }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="ats" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3, fill: "#06B6D4" }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Recent Analyses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        {analyses.length > 0 ? (
          <>
            <h3 className="mb-3 text-base font-semibold">All Analyses</h3>
            <div className="flex flex-col gap-2">
              {[...analyses].reverse().map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#111118] px-5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {a.job_description?.substring(0, 70) || "Analysis"}...
                    </p>
                    <p className="text-xs text-slate-600">
                      {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${a.match_score >= 70 ? "text-emerald-400" : a.match_score >= 40 ? "text-amber-400" : "text-rose-400"}`}>
                        {a.match_score}%
                      </p>
                      <p className="text-[10px] text-slate-600">match</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${a.ats_score >= 70 ? "text-emerald-400" : a.ats_score >= 40 ? "text-amber-400" : "text-rose-400"}`}>
                        {a.ats_score}%
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
            <h3 className="text-base font-semibold text-white">No data yet</h3>
            <p className="mt-1.5 max-w-sm text-sm font-light text-slate-500">
              Run your first resume analysis to start tracking your progress over time.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
