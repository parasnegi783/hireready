"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  IconUser,
  IconBriefcase,
  IconSchool,
  IconCode,
  IconRocket,
  IconFileText,
  IconPlus,
  IconTrash,
  IconDownload,
  IconSparkles,
  IconLoader2,
  IconChevronDown,
  IconChevronUp,
  IconX,
  IconUpload,
} from "@tabler/icons-react";

// ── Types ──────────────────────────────────────────────────────────────
interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}
interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}
interface Project {
  id: string;
  name: string;
  description: string;
  tech: string;
  link: string;
}
interface ResumeData {
  personal: { name: string; email: string; phone: string; location: string; linkedin: string; github: string; website: string };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

// ── Helpers ─────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const EMPTY: ResumeData = {
  personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: IconUser },
  { id: "summary", label: "Summary", icon: IconFileText },
  { id: "experience", label: "Experience", icon: IconBriefcase },
  { id: "education", label: "Education", icon: IconSchool },
  { id: "skills", label: "Skills", icon: IconCode },
  { id: "projects", label: "Projects", icon: IconRocket },
];

const TEMPLATES = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
];

// ── Preview component ────────────────────────────────────────────────────
function ResumePreview({ data, template }: { data: ResumeData; template: string }) {
  const { personal: p, summary, experience, education, skills, projects } = data;

  const isModern = template === "modern";
  const isBold = template === "bold";
  const isClassic = template === "classic";

  const accentColor = isBold ? "#7C3AED" : isModern ? "#0F172A" : isClassic ? "#1E3A5F" : "#374151";
  const accentText = isBold ? "text-purple-700" : isModern ? "text-slate-800" : isClassic ? "text-blue-900" : "text-gray-700";
  const borderColor = isBold ? "border-purple-600" : isModern ? "border-slate-800" : isClassic ? "border-blue-900" : "border-gray-400";

  return (
    <div
      id="resume-preview"
      className="min-h-[297mm] w-full bg-white p-8 text-sm text-gray-900 shadow-xl"
      style={{ fontFamily: "'Georgia', serif", lineHeight: 1.5 }}
    >
      {/* Header */}
      <div className={`mb-4 ${isBold ? "border-b-4 border-purple-600 pb-4" : isModern ? "border-b-2 border-slate-800 pb-4" : "pb-3 border-b border-gray-300"}`}>
        <h1 className={`text-3xl font-bold tracking-tight ${accentText} ${isBold ? "uppercase" : ""}`}>
          {p.name || "Your Name"}
        </h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Summary" accentText={accentText} borderColor={borderColor} isBold={isBold}>
          <p className="text-xs leading-relaxed text-gray-700">{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Experience" accentText={accentText} borderColor={borderColor} isBold={isBold}>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{exp.role || "Role"}</p>
                  <p className={`text-xs font-semibold ${accentText}`}>{exp.company || "Company"}</p>
                </div>
                <p className="shrink-0 text-xs text-gray-500">
                  {exp.startDate}{exp.startDate && " – "}{exp.current ? "Present" : exp.endDate}
                </p>
              </div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-1 list-disc pl-4">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="text-xs text-gray-700">{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education" accentText={accentText} borderColor={borderColor} isBold={isBold}>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2 flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                <p className={`text-xs font-semibold ${accentText}`}>{edu.school}</p>
                {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
              </div>
              <p className="shrink-0 text-xs text-gray-500">
                {edu.startDate}{edu.startDate && " – "}{edu.endDate}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills" accentText={accentText} borderColor={borderColor} isBold={isBold}>
          <p className="text-xs text-gray-700">{skills.join(" · ")}</p>
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects" accentText={accentText} borderColor={borderColor} isBold={isBold}>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{proj.name || "Project"}</p>
                {proj.link && <span className={`text-xs ${accentText}`}>{proj.link}</span>}
              </div>
              {proj.tech && <p className="text-xs font-medium text-gray-500">{proj.tech}</p>}
              {proj.description && <p className="text-xs text-gray-700">{proj.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Placeholder when empty */}
      {!summary && experience.length === 0 && education.length === 0 && skills.length === 0 && (
        <div className="mt-8 text-center text-xs text-gray-400">
          Fill in your details on the left to see your resume here.
        </div>
      )}
    </div>
  );
}

function Section({ title, children, accentText, borderColor, isBold }: {
  title: string; children: React.ReactNode; accentText: string; borderColor: string; isBold: boolean;
}) {
  return (
    <div className="mb-4">
      <h2 className={`mb-1 text-xs font-bold uppercase tracking-widest ${accentText} ${isBold ? `border-b-2 ${borderColor} pb-0.5` : `border-b ${borderColor} pb-0.5`}`}>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function BuilderPage() {
  const [resume, setResume] = useState<ResumeData>(EMPTY);
  const [activeSection, setActiveSection] = useState("personal");
  const [template, setTemplate] = useState("modern");
  const [openExp, setOpenExp] = useState<string | null>(null);
  const [openEdu, setOpenEdu] = useState<string | null>(null);
  const [openProj, setOpenProj] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ── Updaters ──
  function setPersonal(field: string, value: string) {
    setResume((r) => ({ ...r, personal: { ...r.personal, [field]: value } }));
  }

  function addExp() {
    const id = uid();
    setResume((r) => ({ ...r, experience: [...r.experience, { id, company: "", role: "", startDate: "", endDate: "", current: false, bullets: [""] }] }));
    setOpenExp(id);
  }
  function updateExp(id: string, field: string, value: string | boolean | string[]) {
    setResume((r) => ({ ...r, experience: r.experience.map((e) => e.id === id ? { ...e, [field]: value } : e) }));
  }
  function removeExp(id: string) { setResume((r) => ({ ...r, experience: r.experience.filter((e) => e.id !== id) })); }

  function addEdu() {
    const id = uid();
    setResume((r) => ({ ...r, education: [...r.education, { id, school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" }] }));
    setOpenEdu(id);
  }
  function updateEdu(id: string, field: string, value: string) {
    setResume((r) => ({ ...r, education: r.education.map((e) => e.id === id ? { ...e, [field]: value } : e) }));
  }
  function removeEdu(id: string) { setResume((r) => ({ ...r, education: r.education.filter((e) => e.id !== id) })); }

  function addProj() {
    const id = uid();
    setResume((r) => ({ ...r, projects: [...r.projects, { id, name: "", description: "", tech: "", link: "" }] }));
    setOpenProj(id);
  }
  function updateProj(id: string, field: string, value: string) {
    setResume((r) => ({ ...r, projects: r.projects.map((p) => p.id === id ? { ...p, [field]: value } : p) }));
  }
  function removeProj(id: string) { setResume((r) => ({ ...r, projects: r.projects.filter((p) => p.id !== id) })); }

  function addSkill(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const skill = skillInput.trim().replace(/,$/, "");
      if (!resume.skills.includes(skill)) {
        setResume((r) => ({ ...r, skills: [...r.skills, skill] }));
      }
      setSkillInput("");
    }
  }
  function removeSkill(s: string) { setResume((r) => ({ ...r, skills: r.skills.filter((x) => x !== s) })); }

  // ── AI summary ──
  async function generateSummary() {
    const skillsStr = resume.skills.join(", ");
    const expStr = resume.experience.map((e) => `${e.role} at ${e.company}`).join("; ");
    if (!skillsStr && !expStr) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Write a concise 2-3 sentence professional resume summary for someone with these skills: ${skillsStr || "general software development"} and this experience: ${expStr || "software development"}. Return ONLY the summary text, no labels or extra text.`,
          }],
        }),
      });
      const data = await res.json();
      if (data.content) setResume((r) => ({ ...r, summary: data.content.trim() }));
    } catch {}
    setAiLoading(false);
  }

  // ── AI bullet improve ──
  async function improveBullet(expId: string, idx: number) {
    const exp = resume.experience.find((e) => e.id === expId);
    if (!exp || !exp.bullets[idx]) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Rewrite this resume bullet point to be more impactful using action verbs and quantifiable results where possible. Return ONLY the improved bullet, no extra text:\n"${exp.bullets[idx]}"`,
          }],
        }),
      });
      const data = await res.json();
      if (data.content) {
        const newBullets = [...exp.bullets];
        newBullets[idx] = data.content.trim().replace(/^["•\-\*]/, "").trim();
        updateExp(expId, "bullets", newBullets);
      }
    } catch {}
    setAiLoading(false);
  }

  function printResume() { window.print(); }

  // ── Import from PDF ──
  const [importing, setImporting] = useState(false);

  const onImportDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const parseRes = await fetch("/api/resume/parse", { method: "POST", body: formData });
      if (!parseRes.ok) throw new Error("Failed to parse PDF");
      const { text } = await parseRes.json();
      if (!text || text.trim().length < 50) throw new Error("Not enough text in PDF");

      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Extract structured resume data from this text. Return ONLY a valid JSON object, no markdown, no explanation:\n{\n  "name": "",\n  "email": "",\n  "phone": "",\n  "location": "",\n  "linkedin": "",\n  "github": "",\n  "website": "",\n  "summary": "",\n  "skills": ["skill1", "skill2"],\n  "experience": [{"company": "", "role": "", "startDate": "", "endDate": "", "bullets": ["..."]}],\n  "education": [{"school": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": ""}],\n  "projects": [{"name": "", "description": "", "tech": "", "link": ""}]\n}\n\nResume text:\n${text.substring(0, 4000)}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI could not extract data");
      const parsed = JSON.parse(jsonMatch[0]);

      setResume({
        personal: {
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          location: parsed.location || "",
          linkedin: parsed.linkedin || "",
          github: parsed.github || "",
          website: parsed.website || "",
        },
        summary: parsed.summary || "",
        skills: parsed.skills || [],
        experience: (parsed.experience || []).map((e: { company?: string; role?: string; startDate?: string; endDate?: string; bullets?: string[] }) => ({
          id: uid(),
          company: e.company || "",
          role: e.role || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          current: false,
          bullets: e.bullets?.length ? e.bullets : [""],
        })),
        education: (parsed.education || []).map((e: { school?: string; degree?: string; field?: string; startDate?: string; endDate?: string; gpa?: string }) => ({
          id: uid(),
          school: e.school || "",
          degree: e.degree || "",
          field: e.field || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          gpa: e.gpa || "",
        })),
        projects: (parsed.projects || []).map((p: { name?: string; description?: string; tech?: string; link?: string }) => ({
          id: uid(),
          name: p.name || "",
          description: p.description || "",
          tech: p.tech || "",
          link: p.link || "",
        })),
      });
      setActiveSection("personal");
    } catch {
      alert("Could not import resume. Try a different PDF.");
    }
    setImporting(false);
  }, []);

  const { getRootProps: getImportProps, getInputProps: getImportInputProps } = useDropzone({
    onDrop: onImportDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    noClick: false,
  });

  // ── Input style ──
  const inp = "w-full rounded-lg border border-white/[0.08] bg-[#0A0A0F] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10";

  return (
    <div className="flex h-[calc(100vh-4rem-4rem)] gap-0 overflow-hidden">

      {/* ── LEFT: Form Panel ── */}
      <div className="flex w-[340px] shrink-0 flex-col border-r border-white/[0.04] bg-[#0A0A0F]">

        {/* Import from Resume */}
        <div className="border-b border-white/[0.04] p-3">
          <div {...getImportProps()} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-purple-500/30 bg-purple-500/[0.05] px-3 py-2.5 text-sm font-medium text-purple-300 transition-all hover:bg-purple-500/10">
            <input {...getImportInputProps()} />
            {importing ? (
              <><IconLoader2 size={14} className="animate-spin" /> Importing...</>
            ) : (
              <><IconUpload size={14} /> Import from Resume PDF</>
            )}
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex flex-col gap-0.5 border-b border-white/[0.04] p-3">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                activeSection === s.id
                  ? "bg-purple-500/10 font-medium text-purple-300"
                  : "font-light text-slate-500 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <s.icon size={15} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* Personal */}
          {activeSection === "personal" && (
            <div className="flex flex-col gap-3">
              <Field label="Full Name"><input className={inp} placeholder="Paras Negi" value={resume.personal.name} onChange={(e) => setPersonal("name", e.target.value)} /></Field>
              <Field label="Email"><input className={inp} placeholder="you@email.com" value={resume.personal.email} onChange={(e) => setPersonal("email", e.target.value)} /></Field>
              <Field label="Phone"><input className={inp} placeholder="+91 98765 43210" value={resume.personal.phone} onChange={(e) => setPersonal("phone", e.target.value)} /></Field>
              <Field label="Location"><input className={inp} placeholder="Bangalore, India" value={resume.personal.location} onChange={(e) => setPersonal("location", e.target.value)} /></Field>
              <Field label="LinkedIn"><input className={inp} placeholder="linkedin.com/in/username" value={resume.personal.linkedin} onChange={(e) => setPersonal("linkedin", e.target.value)} /></Field>
              <Field label="GitHub"><input className={inp} placeholder="github.com/username" value={resume.personal.github} onChange={(e) => setPersonal("github", e.target.value)} /></Field>
              <Field label="Website"><input className={inp} placeholder="yoursite.com" value={resume.personal.website} onChange={(e) => setPersonal("website", e.target.value)} /></Field>
            </div>
          )}

          {/* Summary */}
          {activeSection === "summary" && (
            <div className="flex flex-col gap-3">
              <textarea
                className={`${inp} resize-none`}
                rows={6}
                placeholder="A results-driven software engineer with 3+ years of experience..."
                value={resume.summary}
                onChange={(e) => setResume((r) => ({ ...r, summary: e.target.value }))}
              />
              <button
                onClick={generateSummary}
                disabled={aiLoading}
                className="flex items-center justify-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2 text-sm font-medium text-purple-300 transition-all hover:bg-purple-500/20 disabled:opacity-50"
              >
                {aiLoading ? <IconLoader2 size={14} className="animate-spin" /> : <IconSparkles size={14} />}
                Generate with AI
              </button>
              <p className="text-xs text-slate-600">AI uses your skills and experience sections to generate a summary.</p>
            </div>
          )}

          {/* Experience */}
          {activeSection === "experience" && (
            <div className="flex flex-col gap-3">
              {resume.experience.map((exp) => (
                <div key={exp.id} className="rounded-xl border border-white/[0.06] bg-[#111118]">
                  <button
                    onClick={() => setOpenExp(openExp === exp.id ? null : exp.id)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-sm"
                  >
                    <span className="truncate font-medium text-white">{exp.role || exp.company || "New Entry"}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); removeExp(exp.id); }} className="text-slate-600 hover:text-rose-400"><IconTrash size={13} /></button>
                      {openExp === exp.id ? <IconChevronUp size={14} className="text-slate-500" /> : <IconChevronDown size={14} className="text-slate-500" />}
                    </div>
                  </button>
                  {openExp === exp.id && (
                    <div className="flex flex-col gap-2 border-t border-white/[0.04] px-3 pb-3 pt-2">
                      <Field label="Company"><input className={inp} placeholder="Google" value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} /></Field>
                      <Field label="Role"><input className={inp} placeholder="Software Engineer" value={exp.role} onChange={(e) => updateExp(exp.id, "role", e.target.value)} /></Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Start"><input className={inp} placeholder="Jun 2022" value={exp.startDate} onChange={(e) => updateExp(exp.id, "startDate", e.target.value)} /></Field>
                        <Field label="End"><input className={inp} placeholder="Present" value={exp.endDate} disabled={exp.current} onChange={(e) => updateExp(exp.id, "endDate", e.target.value)} /></Field>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, "current", e.target.checked)} className="accent-purple-500" />
                        Currently working here
                      </label>
                      <p className="mt-1 text-xs font-medium text-slate-400">Bullet points</p>
                      {exp.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex gap-1.5">
                          <textarea
                            className={`${inp} resize-none`}
                            rows={2}
                            placeholder="Built X that improved Y by Z%..."
                            value={bullet}
                            onChange={(e) => {
                              const nb = [...exp.bullets]; nb[idx] = e.target.value;
                              updateExp(exp.id, "bullets", nb);
                            }}
                          />
                          <div className="flex flex-col gap-1">
                            <button onClick={() => improveBullet(exp.id, idx)} disabled={aiLoading} className="rounded bg-purple-500/10 p-1 text-purple-400 hover:bg-purple-500/20 disabled:opacity-40" title="Improve with AI">
                              {aiLoading ? <IconLoader2 size={11} className="animate-spin" /> : <IconSparkles size={11} />}
                            </button>
                            <button onClick={() => { const nb = exp.bullets.filter((_, i) => i !== idx); updateExp(exp.id, "bullets", nb.length ? nb : [""]); }} className="rounded bg-white/[0.03] p-1 text-slate-600 hover:text-rose-400"><IconTrash size={11} /></button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => updateExp(exp.id, "bullets", [...exp.bullets, ""])} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
                        <IconPlus size={12} /> Add bullet
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addExp} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] py-3 text-sm text-slate-500 transition-all hover:border-purple-500/30 hover:text-purple-400">
                <IconPlus size={15} /> Add Experience
              </button>
            </div>
          )}

          {/* Education */}
          {activeSection === "education" && (
            <div className="flex flex-col gap-3">
              {resume.education.map((edu) => (
                <div key={edu.id} className="rounded-xl border border-white/[0.06] bg-[#111118]">
                  <button onClick={() => setOpenEdu(openEdu === edu.id ? null : edu.id)} className="flex w-full items-center justify-between px-3 py-2.5 text-sm">
                    <span className="truncate font-medium text-white">{edu.school || "New Entry"}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); removeEdu(edu.id); }} className="text-slate-600 hover:text-rose-400"><IconTrash size={13} /></button>
                      {openEdu === edu.id ? <IconChevronUp size={14} className="text-slate-500" /> : <IconChevronDown size={14} className="text-slate-500" />}
                    </div>
                  </button>
                  {openEdu === edu.id && (
                    <div className="flex flex-col gap-2 border-t border-white/[0.04] px-3 pb-3 pt-2">
                      <Field label="School"><input className={inp} placeholder="IIT Delhi" value={edu.school} onChange={(e) => updateEdu(edu.id, "school", e.target.value)} /></Field>
                      <Field label="Degree"><input className={inp} placeholder="B.Tech" value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} /></Field>
                      <Field label="Field of Study"><input className={inp} placeholder="Computer Science" value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)} /></Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Start"><input className={inp} placeholder="2018" value={edu.startDate} onChange={(e) => updateEdu(edu.id, "startDate", e.target.value)} /></Field>
                        <Field label="End"><input className={inp} placeholder="2022" value={edu.endDate} onChange={(e) => updateEdu(edu.id, "endDate", e.target.value)} /></Field>
                      </div>
                      <Field label="GPA (optional)"><input className={inp} placeholder="8.5 / 10" value={edu.gpa} onChange={(e) => updateEdu(edu.id, "gpa", e.target.value)} /></Field>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addEdu} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] py-3 text-sm text-slate-500 transition-all hover:border-purple-500/30 hover:text-purple-400">
                <IconPlus size={15} /> Add Education
              </button>
            </div>
          )}

          {/* Skills */}
          {activeSection === "skills" && (
            <div className="flex flex-col gap-3">
              <Field label="Add skills (press Enter or comma)">
                <input
                  className={inp}
                  placeholder="React, TypeScript, Node.js..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                    {s}
                    <button onClick={() => removeSkill(s)}><IconX size={11} /></button>
                  </span>
                ))}
                {resume.skills.length === 0 && <p className="text-xs text-slate-600">No skills added yet.</p>}
              </div>
            </div>
          )}

          {/* Projects */}
          {activeSection === "projects" && (
            <div className="flex flex-col gap-3">
              {resume.projects.map((proj) => (
                <div key={proj.id} className="rounded-xl border border-white/[0.06] bg-[#111118]">
                  <button onClick={() => setOpenProj(openProj === proj.id ? null : proj.id)} className="flex w-full items-center justify-between px-3 py-2.5 text-sm">
                    <span className="truncate font-medium text-white">{proj.name || "New Project"}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); removeProj(proj.id); }} className="text-slate-600 hover:text-rose-400"><IconTrash size={13} /></button>
                      {openProj === proj.id ? <IconChevronUp size={14} className="text-slate-500" /> : <IconChevronDown size={14} className="text-slate-500" />}
                    </div>
                  </button>
                  {openProj === proj.id && (
                    <div className="flex flex-col gap-2 border-t border-white/[0.04] px-3 pb-3 pt-2">
                      <Field label="Project Name"><input className={inp} placeholder="HireReady" value={proj.name} onChange={(e) => updateProj(proj.id, "name", e.target.value)} /></Field>
                      <Field label="Tech Stack"><input className={inp} placeholder="Next.js, Supabase, AI" value={proj.tech} onChange={(e) => updateProj(proj.id, "tech", e.target.value)} /></Field>
                      <Field label="Link (optional)"><input className={inp} placeholder="github.com/..." value={proj.link} onChange={(e) => updateProj(proj.id, "link", e.target.value)} /></Field>
                      <Field label="Description">
                        <textarea className={`${inp} resize-none`} rows={3} placeholder="Built an AI-powered resume analyzer..." value={proj.description} onChange={(e) => updateProj(proj.id, "description", e.target.value)} />
                      </Field>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addProj} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] py-3 text-sm text-slate-500 transition-all hover:border-purple-500/30 hover:text-purple-400">
                <IconPlus size={15} /> Add Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Preview Panel ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0d0d14]">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3">
          <div className="flex gap-1">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${template === t.id ? "bg-purple-500/10 text-purple-300" : "text-slate-500 hover:text-white"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={printResume}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2 text-xs font-medium text-white shadow-lg hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)]"
          >
            <IconDownload size={13} />
            Download PDF
          </motion.button>
        </div>

        {/* Preview scroll area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[210mm]">
            <ResumePreview data={resume} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}
