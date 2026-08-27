import { create } from "zustand";
import type { JobSearchProfile } from "@/types";
import { DEFAULT_SEARCH_PROFILE } from "@/lib/jobs/target-companies";

interface JobsState {
  resumeText: string | null;
  searchProfile: JobSearchProfile;
  savedJobIds: Set<string>;
  setResumeText: (text: string | null) => void;
  setSearchProfile: (profile: Partial<JobSearchProfile>) => void;
  toggleSavedJob: (jobId: string) => void;
  loadFromStorage: () => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  resumeText: null,
  searchProfile: DEFAULT_SEARCH_PROFILE,
  savedJobIds: new Set(),

  setResumeText: (text) => {
    set({ resumeText: text });
    if (typeof window !== "undefined") {
      if (text) {
        localStorage.setItem("hireready_resume", text);
      } else {
        localStorage.removeItem("hireready_resume");
      }
    }
  },

  setSearchProfile: (partial) => {
    set({ searchProfile: { ...get().searchProfile, ...partial } });
  },

  toggleSavedJob: (jobId) => {
    const saved = new Set(get().savedJobIds);
    if (saved.has(jobId)) {
      saved.delete(jobId);
    } else {
      saved.add(jobId);
    }
    set({ savedJobIds: saved });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "hireready_saved_jobs",
        JSON.stringify([...saved]),
      );
    }
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    const resume = localStorage.getItem("hireready_resume");
    const savedRaw = localStorage.getItem("hireready_saved_jobs");
    set({
      resumeText: resume || null,
      savedJobIds: savedRaw ? new Set(JSON.parse(savedRaw)) : new Set(),
    });
  },
}));
