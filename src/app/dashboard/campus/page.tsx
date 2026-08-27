"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  IconBuilding,
  IconPlus,
  IconUsers,
  IconBriefcase,
  IconCalendar,
  IconSparkles,
  IconKey,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";

interface Drive {
  id: string;
  company_name: string;
  role_title: string;
  description: string;
  min_cgpa: number;
  allowed_branches: string[];
  deadline: string;
  status: string;
  created_at: string;
}

export default function CampusPage() {
  const { user } = useAuthStore();
  const role = (user?.user_metadata?.role as string) || "student";
  const [collegeCode, setCollegeCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joined, setJoined] = useState(false);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user has a college linked
  const [hasCollege, setHasCollege] = useState<boolean | null>(null);
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("college_id")
      .eq("id", user.id)
      .single()
      .then(async ({ data }) => {
        if (data?.college_id) {
          setHasCollege(true);
          // Fetch college name
          const { data: college } = await supabase
            .from("colleges")
            .select("name")
            .eq("id", data.college_id)
            .single();
          if (college) setCollegeName(college.name);
          // Fetch drives
          const { data: drivesData } = await supabase
            .from("drives")
            .select("*")
            .eq("college_id", data.college_id)
            .order("created_at", { ascending: false });
          setDrives(drivesData || []);
        } else {
          setHasCollege(false);
        }
        setLoading(false);
      });
  }, [user?.id, joined]);

  async function joinCollege() {
    if (!collegeCode.trim()) return;
    setJoining(true);
    setJoinError("");
    const { data: college } = await supabase
      .from("colleges")
      .select("id, name")
      .eq("code", collegeCode.trim().toUpperCase())
      .single();
    if (!college) {
      setJoinError("College not found. Check the code and try again.");
      setJoining(false);
      return;
    }
    await supabase
      .from("profiles")
      .update({ college_id: college.id })
      .eq("id", user!.id);
    setJoining(false);
    setJoined(true);
    setHasCollege(true);
    setCollegeName(college.name);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <IconLoader2 size={28} className="animate-spin text-purple-400" />
      </div>
    );
  }

  // ── TPO VIEW ──
  if (role === "tpo") {
    return (
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Placement <span className="gradient-text">Drives</span>
              </h1>
              <p className="mt-1 text-sm font-light text-slate-500">
                {collegeName ? `Managing drives for ${collegeName}` : "Set up your college to start"}
              </p>
            </div>
            {hasCollege && (
              <Link
                href="/dashboard/campus/create"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)]"
              >
                <IconPlus size={16} />
                New Drive
              </Link>
            )}
          </div>
        </motion.div>

        {!hasCollege ? (
          <TPOSetup userId={user!.id} onDone={() => setJoined(true)} />
        ) : drives.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 flex flex-col items-center gap-4 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
              <IconBriefcase size={28} className="text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-white">No drives yet</h3>
            <p className="text-sm font-light text-slate-500">Create your first placement drive to get started.</p>
          </motion.div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {drives.map((drive, i) => (
              <DriveCard key={drive.id} drive={drive} index={i} isTPO />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── STUDENT VIEW ──
  return (
    <div className="mx-auto max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Campus <span className="gradient-text">Drives</span>
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          {collegeName ? `Placement drives at ${collegeName}` : "Join your college to see drives"}
        </p>
      </motion.div>

      {!hasCollege ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
            <IconKey size={28} className="text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Join your college</h3>
          <p className="max-w-sm text-sm font-light text-slate-500">
            Enter the college code provided by your placement cell to see available drives.
          </p>
          <div className="mt-2 flex w-full max-w-xs gap-2">
            <input
              type="text"
              value={collegeCode}
              onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
              placeholder="e.g. IITD2025"
              className="flex-1 rounded-xl border border-white/[0.08] bg-[#111118] px-4 py-3 text-sm font-mono text-white outline-none placeholder:text-slate-600 focus:border-purple-500/50"
            />
            <button
              onClick={joinCollege}
              disabled={joining}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 text-sm font-medium text-white transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
            >
              {joining ? <IconLoader2 size={16} className="animate-spin" /> : "Join"}
            </button>
          </div>
          {joinError && <p className="text-sm text-rose-400">{joinError}</p>}
        </motion.div>
      ) : drives.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
            <IconCalendar size={28} className="text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-white">No drives yet</h3>
          <p className="text-sm font-light text-slate-500">Check back later — your placement cell will post drives here.</p>
        </motion.div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {drives.map((drive, i) => (
            <DriveCard key={drive.id} drive={drive} index={i} isTPO={false} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── TPO College Setup ──
function TPOSetup({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createCollege() {
    if (!name.trim() || !code.trim()) {
      setError("Both fields are required.");
      return;
    }
    setCreating(true);
    setError("");
    const { data, error: err } = await supabase
      .from("colleges")
      .insert({ name, code: code.toUpperCase(), created_by: userId })
      .select("id")
      .single();
    if (err) {
      setError(err.message.includes("unique") ? "This code is already taken." : err.message);
      setCreating(false);
      return;
    }
    await supabase.from("profiles").update({ college_id: data.id }).eq("id", userId);
    setCreating(false);
    onDone();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-12 max-w-md rounded-2xl border border-white/[0.06] bg-[#111118] p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
          <IconBuilding size={20} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Set up your college</h3>
          <p className="text-xs text-slate-500">Students will use the code to join.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">College Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. IIT Delhi"
            className="w-full rounded-lg border border-white/[0.08] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Invite Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. IITD2025"
            className="w-full rounded-lg border border-white/[0.08] bg-[#0A0A0F] px-3 py-2.5 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500/50"
          />
          <p className="mt-1 text-xs text-slate-600">Share this code with students so they can join.</p>
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          onClick={createCollege}
          disabled={creating}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {creating ? <IconLoader2 size={14} className="animate-spin" /> : <IconSparkles size={14} />}
          Create College
        </button>
      </div>
    </motion.div>
  );
}

// ── Drive Card ──
function DriveCard({ drive, index, isTPO }: { drive: Drive; index: number; isTPO: boolean }) {
  const isOpen = drive.status === "open";
  const deadlinePassed = drive.deadline && new Date(drive.deadline) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl border border-white/[0.06] bg-[#111118] p-5 transition-all duration-300 hover:border-purple-500/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">{drive.company_name}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
              isOpen && !deadlinePassed
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-slate-500/20 bg-slate-500/10 text-slate-400"
            }`}>
              {deadlinePassed ? "Closed" : drive.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{drive.role_title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            {drive.min_cgpa > 0 && <span>Min CGPA: {drive.min_cgpa}</span>}
            {drive.allowed_branches?.length > 0 && (
              <span>{drive.allowed_branches.join(", ")}</span>
            )}
            {drive.deadline && (
              <span className="flex items-center gap-1">
                <IconCalendar size={11} />
                Deadline: {new Date(drive.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {isTPO ? (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <IconUsers size={14} /> View
          </span>
        ) : (
          isOpen && !deadlinePassed && (
            <button className="flex items-center gap-1.5 rounded-xl bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition-all hover:bg-purple-500/20">
              <IconCheck size={13} /> Apply
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
