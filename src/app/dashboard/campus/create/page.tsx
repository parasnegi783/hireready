"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  IconSparkles,
  IconLoader2,
  IconArrowLeft,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";

const BRANCHES = [
  "Computer Science", "Information Technology", "Electronics", "Electrical",
  "Mechanical", "Civil", "Chemical", "Biotechnology", "All Branches",
];

export default function CreateDrivePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    role_title: "",
    description: "",
    min_cgpa: "",
    allowed_branches: [] as string[],
    batch_year: new Date().getFullYear().toString(),
    deadline: "",
  });

  function set(field: string, value: string | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleBranch(branch: string) {
    if (branch === "All Branches") {
      set("allowed_branches",
        form.allowed_branches.length === BRANCHES.length - 1
          ? []
          : BRANCHES.filter((b) => b !== "All Branches")
      );
      return;
    }
    set("allowed_branches",
      form.allowed_branches.includes(branch)
        ? form.allowed_branches.filter((b) => b !== branch)
        : [...form.allowed_branches, branch]
    );
  }

  async function handleCreate() {
    if (!form.company_name.trim() || !form.role_title.trim()) {
      setError("Company name and role are required.");
      return;
    }
    setCreating(true);
    setError("");

    // Get user's college_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("college_id")
      .eq("id", user!.id)
      .single();

    if (!profile?.college_id) {
      setError("You need to set up your college first.");
      setCreating(false);
      return;
    }

    const { error: err } = await supabase.from("drives").insert({
      college_id: profile.college_id,
      created_by: user!.id,
      company_name: form.company_name,
      role_title: form.role_title,
      description: form.description,
      min_cgpa: form.min_cgpa ? parseFloat(form.min_cgpa) : 0,
      allowed_branches: form.allowed_branches,
      batch_year: form.batch_year ? parseInt(form.batch_year) : null,
      deadline: form.deadline || null,
    });

    if (err) {
      setError(err.message);
      setCreating(false);
      return;
    }

    router.push("/dashboard/campus");
  }

  const inp = "w-full rounded-xl border border-white/[0.08] bg-[#0A0A0F] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10";

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-white"
        >
          <IconArrowLeft size={16} /> Back to Drives
        </button>
        <h1 className="text-2xl font-bold tracking-tight">
          Create <span className="gradient-text">Drive</span>
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          Add a new placement drive for your college.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 flex flex-col gap-5"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">Company Name *</label>
          <input className={inp} placeholder="e.g. TCS, Infosys, Google" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">Role Title *</label>
          <input className={inp} placeholder="e.g. Software Engineer, Data Analyst" value={form.role_title} onChange={(e) => set("role_title", e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">Job Description</label>
          <textarea className={`${inp} resize-none`} rows={5} placeholder="Paste the full job description..." value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Minimum CGPA</label>
            <input className={inp} type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.0" value={form.min_cgpa} onChange={(e) => set("min_cgpa", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Batch Year</label>
            <input className={inp} type="number" placeholder="e.g. 2025" value={form.batch_year} onChange={(e) => set("batch_year", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">Deadline</label>
          <input className={inp} type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">Allowed Branches</label>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => {
              const selected = b === "All Branches"
                ? form.allowed_branches.length === BRANCHES.length - 1
                : form.allowed_branches.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBranch(b)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    selected
                      ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                      : "border-white/[0.06] text-slate-500 hover:text-white"
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)] disabled:opacity-50"
        >
          {creating ? (
            <><IconLoader2 size={16} className="animate-spin" /> Creating...</>
          ) : (
            <><IconSparkles size={16} /> Create Drive</>
          )}
        </button>
      </motion.div>
    </div>
  );
}
