export interface Analysis {
  id: string;
  userId: string;
  resumeId: string;
  jobDescription: string;
  matchScore: number;
  skillsPresent: string[];
  skillsMissing: string[];
  suggestions: Suggestion[];
  atsScore: number;
  sectionFeedback: SectionFeedback[];
  createdAt: string;
}

export interface Suggestion {
  title: string;
  description: string;
  priority: "critical" | "important" | "nice-to-have";
  before?: string;
  after?: string;
}

export interface SectionFeedback {
  section: string;
  score: number;
  feedback: string;
  tips: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  parsedText: string;
  fileName: string;
  createdAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  matchScore?: number;
  savedAt?: string;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected";
  jobUrl?: string;
  matchScore?: number;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
}

export type JobSource =
  | "greenhouse"
  | "lever"
  | "ashby"
  | "remotive"
  | "adzuna"
  | "arbeitnow";

export interface NormalizedJob {
  id: string;
  source: JobSource;
  externalId: string;
  url: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary: string | null;
  description: string;
  tags: string[];
  postedAt: string;
  employmentType: string | null;
}

export interface ScoredJob extends NormalizedJob {
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  fitReason: string;
  experienceMatch: "under" | "match" | "over";
}

export interface TargetCompany {
  name: string;
  ats: "greenhouse" | "lever" | "ashby";
  boardToken: string;
}

export interface JobSearchProfile {
  keywords: string[];
  titles: string[];
  locations: string[];
  experienceYears: number;
  targetCompanies: TargetCompany[];
  minFitScore: number;
}

export interface InterviewQuestion {
  id: string;
  category: "technical" | "behavioral" | "hr";
  question: string;
  hint?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface InterviewAnswer {
  questionId: string;
  transcript: string;
  score: number;
  feedback: string;
  modelAnswer: string;
  strengths: string[];
  improvements: string[];
}

export interface IntegritySignals {
  lookAwayCount: number;
  lookAwaySeconds: number;
  multipleFacesEvents: number;
  noFaceSeconds: number;
  tabSwitchCount: number;
  secondVoiceEvents: number;
  integrityScore: number;
}

export interface MockInterviewReport {
  role: string;
  answers: InterviewAnswer[];
  overallScore: number;
  integrity: IntegritySignals;
  startedAt: string;
  finishedAt: string;
}
