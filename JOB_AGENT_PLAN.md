# HireReady — Job Discovery Agent: Implementation Plan

**Goal:** Upgrade the existing Job Board from a single-source keyword search into an intelligent, multi-source job-discovery agent that finds relevant roles across many companies, scores each against the user's resume, tracks applications, and delivers a daily curated email digest.

**For:** Claude Code implementation. Each phase below is self-contained with file paths, tech decisions, and acceptance criteria. Build phases in order.

**Existing stack (reuse, don't rebuild):** Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, HuggingFace AI (`moonshotai/Kimi-K2-Instruct-0905` via OpenAI SDK), Supabase (schema built, needs wiring), Zustand, `pdf-parse` v1.1.1.

**What already exists and is reused:**
- `src/app/api/jobs/search/route.ts` — current Remotive-only search (to be extended)
- `src/app/dashboard/jobs/page.tsx` — job board UI (to be enhanced)
- `src/app/api/ai/analyze/route.ts` + `src/lib/prompts.ts` — resume analysis AI (reused for fit scoring)
- `src/app/api/ai/cover-letter/route.ts` — cover letter generation (reused for per-job tailoring)
- `supabase-schema.sql` — `applications` and `saved_jobs` tables (to be wired)
- `src/lib/ai.ts` — `askAI`, `askAIWithHistory` helpers
- `src/lib/supabase.ts` — Supabase client (needs keys)

---

## Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │         Job Sources (Phase 1)            │
                    │  ATS APIs: Greenhouse, Lever, Ashby      │
                    │  Aggregators: Remotive, Adzuna,          │
                    │               Arbeitnow                  │
                    └────────────────┬────────────────────────┘
                                     │  normalized Job[]
                                     ▼
                    ┌─────────────────────────────────────────┐
                    │      Fit Scoring Engine (Phase 2)        │
                    │  Each job → AI scored vs. user resume    │
                    │  Returns fitScore + matchedSkills + gaps │
                    └────────────────┬────────────────────────┘
                                     │  ranked ScoredJob[]
                                     ▼
        ┌────────────────────────────┼─────────────────────────────┐
        ▼                            ▼                              ▼
┌───────────────┐         ┌────────────────────┐        ┌────────────────────┐
│ Job Board UI  │         │  Daily Digest       │        │ Application Tracker│
│ (Phase 2 UI)  │         │  Email (Phase 3)    │        │ Kanban (Phase 4)   │
│ ranked cards  │         │  Vercel Cron + email│        │ Supabase-backed    │
└───────────────┘         └────────────────────┘        └────────────────────┘
```

---

## Data Model (shared across phases)

Add these TypeScript interfaces to `src/types/index.ts`:

```typescript
// A normalized job from any source
export interface NormalizedJob {
  id: string;                 // stable hash of source + external id
  source: string;             // "greenhouse" | "lever" | "ashby" | "remotive" | "adzuna" | "arbeitnow"
  externalId: string;
  url: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary: string | null;
  description: string;        // full text for AI scoring
  tags: string[];
  postedAt: string;           // ISO date
  employmentType: string | null;
}

// A job after AI fit-scoring against the user's resume
export interface ScoredJob extends NormalizedJob {
  fitScore: number;           // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  fitReason: string;          // one-line why it matched
  experienceMatch: "under" | "match" | "over";
}

// User's job-search preferences (drives discovery + scoring)
export interface JobSearchProfile {
  keywords: string[];         // ["AI", "automation", "integration", "python"]
  titles: string[];           // ["Software Engineer", "AI Engineer", "Automation Engineer"]
  locations: string[];        // ["India", "Remote", "Bengaluru"]
  experienceYears: number;    // 1
  targetCompanies: TargetCompany[];
  minFitScore: number;        // e.g. 60 — only surface jobs above this
}

export interface TargetCompany {
  name: string;               // "Cisco"
  ats: "greenhouse" | "lever" | "ashby";
  boardToken: string;         // the company's board slug on that ATS
}
```

---

## PHASE 1 — Multi-Source Job Discovery

**Objective:** Replace the single Remotive call with a fan-out aggregator that pulls jobs from multiple ATS platforms and job-board APIs, normalizes them, and de-duplicates.

### 1.1 Create source adapters

Create `src/lib/jobs/sources/` with one file per source. Each exports an async function returning `NormalizedJob[]`. All must fail gracefully (return `[]` on error, never throw).

**`src/lib/jobs/sources/greenhouse.ts`**
- Endpoint: `https://boards-api.greenhouse.io/v1/boards/{boardToken}/jobs?content=true`
- Public JSON, no auth. `content=true` includes the full job description.
- Map: `jobs[].title`, `.location.name`, `.absolute_url`, `.content` (HTML — strip tags for description), `.updated_at`, `.id`
- Takes `boardToken` (e.g. "cisco") as argument.

**`src/lib/jobs/sources/lever.ts`**
- Endpoint: `https://api.lever.co/v0/postings/{boardToken}?mode=json`
- Public JSON. Map: `.text` (title), `.categories.location`, `.categories.commitment`, `.hostedUrl`, `.descriptionPlain`, `.createdAt`, `.id`

**`src/lib/jobs/sources/ashby.ts`**
- Endpoint: `https://api.ashbyhq.com/posting-api/job-board/{boardToken}?includeCompensation=true`
- Public JSON. Map from `.jobs[]`: `.title`, `.location`, `.jobUrl`, `.descriptionPlain`, `.publishedAt`, `.id`

**`src/lib/jobs/sources/remotive.ts`**
- Keep existing logic from current `jobs/search/route.ts`. Endpoint: `https://remotive.com/api/remote-jobs?search={query}`
- Now returns `NormalizedJob[]` (add `description` from `job.description`, strip HTML).

**`src/lib/jobs/sources/adzuna.ts`**
- Endpoint: `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_APP_KEY}&what={query}&results_per_page=20`
- Requires free API keys (register at developer.adzuna.com). `in` = India country code.
- Map from `.results[]`: `.title`, `.location.display_name`, `.redirect_url`, `.description`, `.created`, `.company.display_name`, `.salary_min`

**`src/lib/jobs/sources/arbeitnow.ts`**
- Endpoint: `https://www.arbeitnow.com/api/job-board-api` (free, no auth)
- Map from `.data[]`: `.title`, `.company_name`, `.location`, `.url`, `.description`, `.created_at`, `.remote`, `.tags`

### 1.2 HTML-stripping utility

Create `src/lib/jobs/utils.ts`:
- `stripHtml(html: string): string` — remove tags, decode entities, collapse whitespace (many descriptions are HTML).
- `makeJobId(source: string, externalId: string): string` — stable id (e.g. `${source}_${externalId}`).
- `dedupeJobs(jobs: NormalizedJob[]): NormalizedJob[]` — dedupe by normalized `title + company`.

### 1.3 Aggregator orchestrator

Create `src/lib/jobs/aggregate.ts`:
```typescript
export async function aggregateJobs(profile: JobSearchProfile): Promise<NormalizedJob[]>
```
- For each `targetCompany`, call the matching ATS adapter (greenhouse/lever/ashby) with its `boardToken`.
- For aggregators (remotive, adzuna, arbeitnow), call once per keyword/title query.
- Run all source calls in parallel with `Promise.allSettled` (one slow/failed source must not block others).
- Merge, dedupe, and return. Filter aggregator results to roles matching the profile's titles/keywords (ATS results are already company-scoped, keep all).

### 1.4 Update the API route

Rewrite `src/app/api/jobs/search/route.ts`:
- `POST` accepting a `JobSearchProfile` in the body (fall back to a default profile if none).
- Calls `aggregateJobs(profile)`.
- Returns `{ jobs: NormalizedJob[] }`.
- Keep a `GET` for simple keyword search (backward compatibility with current UI) that builds a minimal profile from `?q=`.

### 1.5 Seed a default target-company list

Create `src/lib/jobs/target-companies.ts` exporting a starter `TargetCompany[]`. Include known ATS tokens, e.g.:
- Note: boardTokens must be verified per company (the slug in their careers URL). Include a documented list the user can edit. Examples of the *shape* (verify tokens before relying on them):
  ```typescript
  export const DEFAULT_TARGET_COMPANIES: TargetCompany[] = [
    { name: "Example (Greenhouse)", ats: "greenhouse", boardToken: "REPLACE_ME" },
    { name: "Example (Lever)", ats: "lever", boardToken: "REPLACE_ME" },
    { name: "Example (Ashby)", ats: "ashby", boardToken: "REPLACE_ME" },
  ];
  ```
- Add a comment explaining how to find a boardToken: look at the company's careers page URL (e.g. `jobs.lever.co/COMPANY` → boardToken is `COMPANY`; `boards.greenhouse.io/COMPANY` → `COMPANY`; `jobs.ashbyhq.com/COMPANY` → `COMPANY`).

### Phase 1 Acceptance Criteria
- [ ] `POST /api/jobs/search` with a profile returns merged, deduped jobs from ≥3 sources
- [ ] A failing/slow source returns `[]` and does not break the response
- [ ] Each job has a non-empty `description` (needed for Phase 2 scoring)
- [ ] Existing `GET ?q=` keyword search still works for the current UI

### Phase 1 Environment Variables (add to `.env.local`)
```env
ADZUNA_APP_ID=your_id
ADZUNA_APP_KEY=your_key
```

---

## PHASE 2 — AI Fit-Scoring & Ranked Job Board

**Objective:** Score each discovered job against the user's resume, rank by fit, and show it in the Job Board UI with fit scores, matched skills, and gaps.

### 2.1 Fit-scoring prompt

Add to `src/lib/prompts.ts`:
```typescript
export const JOB_FIT_PROMPT = `You are a career-matching engine. Given a candidate's resume and a job description, score the fit.
Return ONLY valid JSON:
{
  "fitScore": <0-100>,
  "matchedSkills": [<skills from the resume that match the job>],
  "missingSkills": [<key skills the job wants that the resume lacks>],
  "fitReason": "<one sentence on why this is or isn't a good match>",
  "experienceMatch": "under" | "match" | "over"
}
Be strict and realistic. Weight required skills, experience level, and domain relevance.
RESUME:
{{resume}}
JOB TITLE: {{title}}
JOB DESCRIPTION:
{{description}}`;
```

### 2.2 Scoring service

Create `src/lib/jobs/score.ts`:
```typescript
export async function scoreJob(resumeText: string, job: NormalizedJob): Promise<ScoredJob>
export async function scoreJobs(resumeText: string, jobs: NormalizedJob[]): Promise<ScoredJob[]>
```
- `scoreJob` fills `JOB_FIT_PROMPT`, calls `askAI` (temperature 0.2), parses JSON with the existing robust `tryParseJSON` pattern from `analyze/route.ts` (extract that helper into `src/lib/ai-json.ts` and reuse in both places).
- `scoreJobs` scores in **batches of 4-5 concurrently** (avoid rate limits), with a small delay between batches. Sort the result by `fitScore` descending.
- Cap the number scored per run (e.g. top 30 by keyword pre-filter) to control cost/time.

### 2.3 Scored search API

Create `src/app/api/jobs/matched/route.ts`:
- `POST` accepting `{ profile: JobSearchProfile, resumeText: string }`.
- Calls `aggregateJobs(profile)` → `scoreJobs(resumeText, jobs)` → filters by `profile.minFitScore` → returns ranked `ScoredJob[]`.
- Resume text source: the user's most recent parsed resume (from Supabase `resumes` table once Phase 4 wiring is done; until then accept `resumeText` in the body, populated from the existing analyzer flow / localStorage).

### 2.4 Enhance the Job Board UI

Update `src/app/dashboard/jobs/page.tsx`:
- Call `/api/jobs/matched` instead of the plain search when a resume is available.
- Each job card shows: **fit score badge** (color-coded: ≥80 emerald, 60-79 amber, <60 muted), **matched skills** (chips), **missing skills** (muted chips), **fitReason** line, source badge, and the existing title/company/location/apply link.
- Sort by fit score. Add a filter slider for `minFitScore` and a source filter.
- Add a "Save" button (bookmark → Phase 4 `saved_jobs`) and a "Track" button (→ `applications`).
- Keep the existing loading/skeleton and animation patterns.

### Phase 2 Acceptance Criteria
- [ ] Jobs display sorted by AI fit score with matched/missing skills visible
- [ ] Scoring handles malformed AI JSON without crashing (reuses robust parser)
- [ ] `minFitScore` filter works; low-fit jobs are hidden
- [ ] Scoring is batched and does not hit rate limits on a 30-job run

---

## PHASE 3 — Daily Digest Email (the Agent)

**Objective:** A scheduled agent that runs every morning, discovers + scores jobs, and emails the user their top matches with a tailored cover letter per job.

### 3.1 Email sending

Choose **Resend** (simplest for Next.js; free tier). Add `resend` package.
Create `src/lib/email.ts`:
```typescript
export async function sendDigestEmail(to: string, jobs: ScoredJob[]): Promise<void>
```
- Render an HTML email: greeting, then top 5 jobs as cards (title, company, fit score, fitReason, matched skills, apply link). Clean, mobile-friendly inline-CSS HTML.
- Include a link back to the HireReady dashboard.

### 3.2 Optional per-job tailoring

Reuse `src/app/api/ai/cover-letter/route.ts` logic: for the top 2-3 matches, generate a short tailored intro paragraph and include it in the email (or link to generate on-demand in the app to save cost). Make this configurable.

### 3.3 Cron endpoint

Create `src/app/api/cron/digest/route.ts`:
- `GET` protected by a secret header check (`CRON_SECRET`) so only the scheduler can trigger it.
- Loads the user's `JobSearchProfile` + latest resume text (from Supabase once wired; until then a config file / single-user env).
- Runs: `aggregateJobs` → `scoreJobs` → take top N above `minFitScore` → `sendDigestEmail`.
- De-dupe against jobs already emailed (store emailed job ids in a Supabase `digest_sent` table or `saved_jobs` with a flag) so the user doesn't see the same job twice.

### 3.4 Schedule it

Add `vercel.json`:
```json
{
  "crons": [{ "path": "/api/cron/digest", "schedule": "0 3 * * *" }]
}
```
(3:00 UTC ≈ 8:30 AM IST. Adjust as desired. Vercel Cron calls the path on schedule; the route checks `CRON_SECRET`.)

### Phase 3 Acceptance Criteria
- [ ] Hitting `/api/cron/digest` with the correct secret sends an email with ranked matches
- [ ] Wrong/missing secret returns 401
- [ ] Already-emailed jobs are not repeated in the next run
- [ ] Vercel Cron config present and documented

### Phase 3 Environment Variables
```env
RESEND_API_KEY=your_key
DIGEST_TO_EMAIL=parasnegi783@gmail.com
CRON_SECRET=some_long_random_string
```

---

## PHASE 4 — Application Tracker & Supabase Wiring

**Objective:** Persist saved jobs, applications (Kanban), and resume text, wiring the existing Supabase schema so the whole system is multi-run and stateful.

### 4.1 Complete Supabase setup (prereqs — see `owner_work.txt`)
- Create Supabase project, add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
- Run `supabase-schema.sql` (creates `profiles`, `resumes`, `analyses`, `chat_messages`, `applications`, `saved_jobs` with RLS).
- Add a `service role` key as `SUPABASE_SERVICE_ROLE_KEY` for the cron route (server-side, bypasses RLS for the single-user agent).
- Add two new tables via a migration file `supabase-jobs-schema.sql`:
  - `digest_sent (id, user_id, job_id, sent_at)` — dedupe emailed jobs
  - extend `saved_jobs` / `applications` to store `fit_score`, `source`, `url`, `job_title`, `company` if not already present.

### 4.2 Auth wiring (prereq)
- Wire `src/app/login/page.tsx` to real Supabase auth (`signInWithGoogle`, `signInWithEmail`) using existing `src/lib/supabase.ts` + `src/store/auth-store.ts`.
- Add middleware to protect `/dashboard/*`.

### 4.3 Saved jobs + application tracker API
Create `src/app/api/applications/route.ts`:
- `GET` — list the user's applications grouped by status.
- `POST` — add/move an application (`status`: saved | applied | interview | offer | rejected).
Create `src/app/api/saved-jobs/route.ts`:
- `GET`/`POST`/`DELETE` for bookmarking.

### 4.4 Kanban UI
Enhance `src/app/dashboard/progress/page.tsx` (or a new `src/app/dashboard/tracker/page.tsx`):
- Kanban columns: Saved → Applied → Interview → Offer → Rejected.
- Cards show company, title, fit score, source, apply link, date.
- Drag-and-drop to move between columns (persist to `applications`).
- Show stats: total applied, response rate, avg fit score (reuse Recharts).

### 4.5 Resume as source of truth
- Store the user's latest parsed resume text in `resumes` table on upload (already parsed by `api/resume/parse`).
- Fit-scoring and the cron digest read the latest resume from Supabase instead of localStorage/body.

### Phase 4 Acceptance Criteria
- [ ] Login works with Supabase (Google + email)
- [ ] Saving a job persists to `saved_jobs`; appears after refresh
- [ ] Moving an application between Kanban columns persists to `applications`
- [ ] Cron digest reads resume + profile from Supabase (fully stateful, multi-run)
- [ ] Stats on the tracker reflect real data

---

## PHASE 5 — AI Proctored Mock Interview

**Objective:** A voice-based mock interview where an AI asks role-specific questions, the user answers out loud, the AI evaluates each answer, and a client-side "focus & integrity" layer (webcam + audio + tab monitoring) produces an integrity report. All proctoring runs in the browser; no video/audio ever leaves the device.

**Reuses:** `INTERVIEW_QUESTIONS_PROMPT` and `MOCK_INTERVIEW_EVALUATE_PROMPT` from `src/lib/prompts.ts`, `askAI` from `src/lib/ai.ts`, the existing interview UI at `src/app/dashboard/interview/page.tsx`.

**Important framing:** This is a self-practice tool. Proctoring signals are approximate — present them as "focus & integrity signals" to help the user practice under realistic conditions, NOT as courtroom-grade anti-cheat. Gaze/voice detection produce false positives (looking away to think is normal). Build the UI copy accordingly.

### 5.1 Data model

Add to `src/types/index.ts`:

```typescript
export interface InterviewQuestion {
  id: string;
  category: "technical" | "behavioral" | "hr";
  question: string;
}

export interface InterviewAnswer {
  questionId: string;
  transcript: string;        // from speech-to-text
  score: number;             // 0-100
  feedback: string;
  modelAnswer: string;
  strengths: string[];
  improvements: string[];
}

export interface IntegritySignals {
  lookAwayCount: number;      // times gaze left the screen
  lookAwaySeconds: number;    // total time looking away
  multipleFacesEvents: number;
  noFaceSeconds: number;      // time no face detected
  tabSwitchCount: number;     // Page Visibility blur events
  secondVoiceEvents: number;  // background/other-voice detections
  integrityScore: number;     // 0-100 derived composite
}

export interface MockInterviewReport {
  role: string;
  answers: InterviewAnswer[];
  overallScore: number;
  integrity: IntegritySignals;
  startedAt: string;
  finishedAt: string;
}
```

### 5.2 Question generation API

Create `src/app/api/ai/mock-interview/route.ts`:
- `POST { role, jobDescription?, count }` → uses `INTERVIEW_QUESTIONS_PROMPT` to generate `InterviewQuestion[]` (mix of technical/behavioral/HR).
- Returns JSON parsed with the shared `tryParseJSON` (from `src/lib/ai-json.ts`).

### 5.3 Answer evaluation API

Create `src/app/api/ai/mock-interview/evaluate/route.ts`:
- `POST { question, transcript, role }` → uses `MOCK_INTERVIEW_EVALUATE_PROMPT` → returns `{ score, feedback, modelAnswer, strengths, improvements }`.
- Temperature 0.3. Robust JSON parse.

### 5.4 Speech layer (browser-native, no cost)

Create `src/lib/interview/speech.ts`:
- `speak(text: string): Promise<void>` — Text-to-Speech via `window.speechSynthesis` (AI "asks" the question aloud).
- `startListening(onResult, onEnd)` / `stopListening()` — Speech-to-Text via `webkitSpeechRecognition` / `SpeechRecognition` (Web Speech API). Captures the spoken answer as text.
- Feature-detect and gracefully fall back to a typed-answer textarea if the browser lacks the API (Safari/Firefox partial support).

### 5.5 Proctoring layer (client-side only)

Create `src/lib/interview/proctor/` — each module runs in the browser and emits events; nothing is uploaded.

**`face.ts` — webcam vision (MediaPipe Tasks Vision FaceLandmarker):**
- Load `@mediapipe/tasks-vision` FaceLandmarker (WASM + model from CDN).
- On each video frame:
  - **Gaze / look-away:** estimate head yaw/pitch + iris position from landmarks; if gaze is off-screen beyond a threshold for >1.5s, increment `lookAwayCount` and accumulate `lookAwaySeconds`.
  - **Face presence:** if 0 faces for >2s, accumulate `noFaceSeconds`.
  - **Multiple faces:** if >1 face detected, increment `multipleFacesEvents`.
- Throttle to ~5-10 fps for performance. Expose `start()`, `stop()`, and a signals callback.

**`audio.ts` — Web Audio analysis:**
- Get mic stream (already needed for STT), run an `AnalyserNode`.
- Detect **second-voice/background speech**: rough heuristic — while the user is NOT actively speaking (STT not capturing) but sustained speech-band energy is present, flag a `secondVoiceEvents`. Clearly-labeled as approximate.
- Do NOT attempt reliable speaker diarization; keep it heuristic.

**`focus.ts` — tab/window monitoring (most reliable):**
- Page Visibility API + `window.blur`/`focus`: each time the interview tab loses focus during a live question, increment `tabSwitchCount` (this is the strongest anti-"Googling" signal).

**`integrity.ts` — compositor:**
- Combine all signals into `IntegritySignals` and compute `integrityScore` (start 100, subtract weighted penalties: tab switches heaviest, then multiple faces, no-face, look-aways, second voice). Clamp 0-100.

### 5.6 Permissions & privacy

- Before starting, show a **consent screen**: "This mock interview uses your camera and microphone to give you realistic practice and focus feedback. All processing happens on your device — nothing is recorded or uploaded." Require explicit "Start" click.
- Request `getUserMedia({ video: true, audio: true })` once; reuse the stream for STT + face + audio.
- Store only the derived numeric signals (never frames/audio).

### 5.7 Interview runner UI

Enhance `src/app/dashboard/interview/page.tsx` (or a new `src/app/dashboard/interview/mock/page.tsx`):
- **Setup:** pick role / paste JD, choose #questions, consent to camera/mic.
- **Live screen:**
  - Small webcam preview (with a subtle "focus monitoring on" indicator).
  - AI speaks the question (TTS) + shows it as text.
  - "Record answer" button → STT transcribes live; user can stop.
  - Live subtle indicators (e.g., a focus dot that turns amber when looking away) — non-punitive, informative.
  - Next question after each answer is submitted + evaluated.
- **Report screen (`MockInterviewReport`):**
  - Per-question: score, feedback, strengths, improvements, model answer.
  - Overall score.
  - **Integrity panel:** integrity score + human-readable flags ("Switched tabs 2×", "Looked away 8×", "Second voice detected 1×"), with a clear note that these are practice signals, not judgments.
  - Save to Supabase (Phase 4) `analyses`-style table or a new `mock_interviews` table.

### 5.8 Packages to add

```
@mediapipe/tasks-vision
```
(Web Speech API, Web Audio API, Page Visibility API are all browser-native — no packages.)

### Phase 5 Acceptance Criteria
- [ ] AI generates role-specific questions and speaks them via TTS
- [ ] User answers by voice; STT transcribes (typed fallback if unsupported)
- [ ] Each answer is AI-evaluated with score + feedback + model answer
- [ ] Webcam face/gaze detection increments look-away, no-face, and multiple-face signals
- [ ] Tab-switch detection works (strongest integrity signal)
- [ ] Second-voice detection produces approximate flags (clearly labeled)
- [ ] Consent screen shown; no video/audio is uploaded — only derived signals stored
- [ ] Final report shows per-question scores + an integrity panel with plain-English flags

### Phase 5 Notes for Claude Code
- All proctoring is **client-side**. Never upload frames or audio. Only persist numeric signals.
- Feature-detect Web Speech API; provide a typed-answer fallback.
- Throttle MediaPipe inference (~5-10 fps) to keep the tab responsive.
- Frame all integrity output as "focus & practice signals," never accusatory language.
- Reuse the shared `tryParseJSON` and `askAI`; keep the dark-luxe UI + Framer Motion.

---

## Build Order & Milestones

| Milestone | Phases | Outcome |
|---|---|---|
| M1 — Discovery | Phase 1 | Multi-source job pull works via API |
| M2 — Intelligence | Phase 2 | Ranked, AI-scored job board in the UI |
| M3 — Agent | Phase 3 | Daily email digest of top matches |
| M4 — Stateful | Phase 4 | Supabase-backed tracker + auth, fully persistent |
| M5 — Interview | Phase 5 | AI proctored voice mock interview + integrity report |

Recommended: complete M1 and M2 first (immediately useful in the app), then M3 (the "agent" wow-factor and resume story), then M4 (persistence/polish). Phase 5 (mock interview) is independent of the job-agent phases — it can be built any time after the shared `ai-json.ts` helper exists; it's a strong standalone showcase.

---

## Skills This Project Demonstrates (for resume / interviews)

- **Multi-API integration** — ATS platforms (Greenhouse/Lever/Ashby) + job aggregators, with graceful degradation via `Promise.allSettled`
- **AI/LLM engineering** — structured fit-scoring, robust JSON parsing, batched concurrent inference with rate-limit handling
- **Agentic + scheduled workflows** — cron-driven autonomous digest agent with dedupe/state
- **Full-stack** — Next.js App Router API routes, React dashboard, Supabase (Postgres + Auth + RLS)
- **Product thinking** — solves a real discovery problem end-to-end

**One-line resume bullet:**
> Built an agentic job-discovery engine that aggregates listings across Greenhouse/Lever/Ashby ATS platforms and job APIs, scores fit against a resume using LLM inference, and delivers a daily curated email digest — full-stack (Next.js, Supabase, scheduled cron agent).

---

## Notes for Claude Code

- Reuse the existing `tryParseJSON` from `src/app/api/ai/analyze/route.ts` — extract it to `src/lib/ai-json.ts` and import in both places (don't duplicate).
- Reuse `askAI` from `src/lib/ai.ts` for all inference; keep temperature 0.2 for scoring.
- Every external source adapter must be wrapped so one failure never breaks the aggregate (`Promise.allSettled`, try/catch → `[]`).
- Keep the existing dark-luxe UI system and Framer Motion patterns for all new UI.
- Verify each `boardToken` against the company's live careers URL before trusting results — tokens are the slug in the ATS URL.
- Do not scrape LinkedIn or any site that prohibits it — only use the public JSON APIs listed here. For LinkedIn/Indeed coverage, rely on the aggregator APIs and (optionally) let the user forward job-alert emails as a future source.
- Cost control: pre-filter jobs by keyword before AI scoring, cap scored jobs per run, batch inference.
```
