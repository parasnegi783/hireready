# HireReady — Complete Project Context

## What Is This Project

HireReady is an AI-powered career coaching platform inspired by [Offerpath](https://www.offerpath.co.in/) but with significantly improved UI, architecture, and features. It helps job seekers analyze resumes, prepare for interviews, build resumes, and find matching jobs.

**Created**: March 26, 2026
**Location**: `~/Documents/Projects/hireready`
**Owner**: Paras Negi

---

## Origin Story

1. Paras asked to review the website offerpath.co.in
2. We did a thorough review — praised the design/copy but found critical issues:
   - Mobile navigation completely broken (no hamburger menu)
   - Missing legal pages (Terms, Privacy)
   - Dead footer links
   - Logo was 567KB for a 38x38px display
   - No SEO meta tags
   - `cursor: none` accessibility issue
   - Everything in a single HTML file
3. Paras wanted to build something similar but better
4. We planned and built HireReady from scratch

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion + custom Aceternity-style effects |
| AI | HuggingFace Router API (`https://router.huggingface.co/v1`) via OpenAI SDK |
| AI Model | `moonshotai/Kimi-K2-Instruct-0905` |
| Database | Supabase (PostgreSQL + Auth + Storage) — **NOT YET CONNECTED** |
| PDF Parsing | `pdf-parse` v1.1.1 |
| Auth | Supabase Auth (Google + Email) — **NOT YET CONNECTED** |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | @tabler/icons-react |

---

## Design System

**Theme**: Dark Luxe (Linear/Vercel style) + Bold Dramatic animations (Aceternity-style)

**Colors**:
- Background: `#0A0A0F` (near-black)
- Card/Surface: `#111118`
- Accent Violet: `#7C3AED` (primary)
- Accent Cyan: `#06B6D4` (secondary)
- Accent Emerald: `#10B981` (success)
- Accent Amber: `#F59E0B` (warning)
- Accent Rose: `#F43F5E` (error)
- Text Primary: `#F8FAFC`
- Text Muted: `#64748B`

**Fonts**: Inter (headings + body), JetBrains Mono (code/data)

**Animations**: Spotlight cursor follow, gradient orbs, typewriter text rotation, 3D card tilt, infinite marquee, staggered reveals, spring physics, animated beam connectors

---

## Project Structure

```
hireready/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout (Inter font, dark theme, Toaster)
│   │   ├── globals.css                 # Dark luxe theme CSS variables
│   │   ├── login/page.tsx              # Auth page (split-panel design)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Dashboard shell (sidebar + topbar)
│   │   │   ├── page.tsx                # Dashboard home (welcome, stats, quick actions)
│   │   │   ├── analyze/page.tsx        # Resume Analyzer (PDF upload + AI analysis)
│   │   │   ├── builder/page.tsx        # Resume Builder (template selection)
│   │   │   ├── interview/page.tsx      # Interview Prep (categories + mock)
│   │   │   ├── jobs/page.tsx           # Job Board (listings with match scores)
│   │   │   ├── coach/page.tsx          # AI Coach Chat (real-time chat)
│   │   │   └── progress/page.tsx       # Progress Tracker (stats + charts)
│   │   └── api/
│   │       ├── ai/
│   │       │   ├── analyze/route.ts    # POST: Resume analysis (WORKING with real AI)
│   │       │   ├── coach/route.ts      # POST: AI coach chat (WORKING with real AI)
│   │       │   ├── interview/route.ts  # POST: Interview question generation
│   │       │   ├── suggestions/route.ts # POST: Improvement suggestions
│   │       │   └── cover-letter/route.ts # POST: Cover letter generation
│   │       └── resume/
│   │           └── parse/route.ts      # POST: PDF to text extraction (WORKING)
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (button, card, input, etc.)
│   │   ├── landing/                    # Landing page sections
│   │   │   ├── navbar.tsx              # Fixed nav with mobile drawer
│   │   │   ├── hero.tsx                # Hero with spotlight, orbs, typewriter
│   │   │   ├── spotlight.tsx           # Mouse-following gradient glow
│   │   │   ├── gradient-orbs.tsx       # Animated background blobs
│   │   │   ├── typewriter.tsx          # Rotating text animation
│   │   │   ├── tilt-card.tsx           # 3D perspective tilt on hover
│   │   │   ├── marquee.tsx             # Infinite scroll trust bar
│   │   │   ├── problem-section.tsx     # Pain points + quote
│   │   │   ├── features-section.tsx    # Bento grid with score demo
│   │   │   ├── how-it-works.tsx        # 3 steps with beam connector
│   │   │   ├── testimonials.tsx        # User story cards
│   │   │   ├── pricing-section.tsx     # Free / Pro / Campus tiers
│   │   │   ├── cta-section.tsx         # Final call-to-action
│   │   │   └── footer.tsx              # Links + social + legal
│   │   └── dashboard/
│   │       └── sidebar.tsx             # Collapsible sidebar with active indicator
│   ├── lib/
│   │   ├── ai.ts                       # HuggingFace AI client (askAI, askAIWithHistory)
│   │   ├── supabase.ts                 # Supabase client + auth helpers (ready, needs keys)
│   │   ├── prompts.ts                  # All AI prompt templates (6 prompts)
│   │   └── utils.ts                    # cn() utility from shadcn
│   ├── store/
│   │   └── auth-store.ts              # Zustand auth state (ready, needs Supabase)
│   └── types/
│       └── index.ts                    # TypeScript interfaces for all data models
├── supabase-schema.sql                 # Full database schema with RLS policies
├── owner_work.txt                      # Setup guide for Paras (3 tasks)
├── test/data/05-versions-space.pdf     # Required by pdf-parse library on import
├── .env.local                          # HF_TOKEN set, Supabase keys pending
└── CONTEXT.md                          # This file
```

---

## What's Working Right Now

| Feature | Status | Details |
|---------|--------|---------|
| Landing Page | WORKING | All 9 sections with animations |
| Login Page | UI ONLY | Form exists, auth not connected |
| Dashboard | WORKING | Layout, sidebar, stats, quick actions |
| Resume Analyzer | WORKING (AI) | PDF upload → parse → HuggingFace AI analysis → real scores |
| AI Coach Chat | WORKING (AI) | Real-time chat with HuggingFace AI |
| Interview Prep | UI ONLY | Category cards, mock interview placeholder |
| Resume Builder | UI ONLY | Template selection, empty state |
| Job Board | UI ONLY | Sample listings with match scores (static data) |
| Progress Tracker | UI ONLY | Stats grid, empty chart placeholder |

---

## What's NOT Connected Yet (Paras's Tasks)

Detailed instructions in `owner_work.txt`. Three tasks:

### Task 1: HuggingFace Token — DONE
- Token added to `.env.local`
- AI features are working

### Task 2: Supabase Project — PENDING
- Create project at supabase.com
- Get URL + anon key → add to `.env.local`
- Run `supabase-schema.sql` in SQL Editor (creates 6 tables + RLS)
- Create `resumes` storage bucket with upload/read policies
- This will enable: user accounts, saving analyses, chat history, application tracking

### Task 3: Google OAuth — PENDING
- Create OAuth credentials in Google Cloud Console
- Add redirect URI: `https://XXXX.supabase.co/auth/v1/callback`
- Add Client ID + Secret to Supabase Auth > Providers > Google
- This will enable: "Continue with Google" button on login page

---

## After Paras Completes Setup Tasks

Once Supabase keys are in `.env.local`, the next steps are:
1. Wire login page to real Supabase auth (signInWithGoogle, signInWithEmail)
2. Add auth middleware to protect `/dashboard/*` routes
3. Save analysis results to Supabase `analyses` table
4. Save chat messages to `chat_messages` table
5. Wire up resume upload to Supabase Storage
6. Show real user name/avatar in sidebar and dashboard
7. Wire interview prep to real AI API
8. Connect job board to a job search API (Adzuna or JSearch)
9. Build progress tracking with real data from `analyses` table
10. Deploy to Vercel

---

## Key Technical Decisions & Gotchas

### pdf-parse Library
- Must use **v1.1.1** (not v2+). v2 requires `@napi-rs/canvas` and `DOMMatrix` which don't exist in Node.js server
- The library auto-reads `test/data/05-versions-space.pdf` on module import — this file MUST exist in the project root
- We copied the actual test PDF from `node_modules/pdf-parse/test/data/`

### AI JSON Parsing
- The HuggingFace model sometimes returns truncated JSON or uses different priority values than requested
- The `/api/ai/analyze/route.ts` has a robust `tryParseJSON()` function that:
  - Strips markdown code blocks
  - Finds matching braces (handles truncated responses by closing open brackets)
  - Fixes trailing commas
  - Normalizes priority values (`high` → `critical`, `medium` → `important`)

### AI Model
- Using `moonshotai/Kimi-K2-Instruct-0905` via HuggingFace Router
- Same model Paras used in his MCP POC project (`~/Documents/Mule/mcp-poc/`)
- API is OpenAI-compatible: `https://router.huggingface.co/v1`
- Model works well for structured JSON output with low temperature (0.2)

### Tailwind v4
- No `tailwind.config.js` — all config is in CSS (`globals.css` with `@theme inline`)
- shadcn/ui v4 components use CSS variables for theming
- Custom animations (marquee) defined as `@keyframes` in globals.css

### Dark-First Theme
- The `<html>` element has `class="dark"` by default
- All CSS variables in `:root` are dark theme values
- No light mode toggle yet (planned for Phase 4)

---

## Environment Variables

```env
# WORKING
HF_TOKEN=hf_xxxxx                          # HuggingFace API token

# PENDING (Paras to set up)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Build & Run

```bash
cd ~/Documents/Projects/hireready
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (16 routes, all passing)
```

---

## File Reference: AI Prompts

All in `src/lib/prompts.ts`:
1. `RESUME_ANALYSIS_PROMPT` — Returns JSON with matchScore, atsScore, skills, suggestions, sectionFeedback
2. `COACH_SYSTEM_PROMPT` — System message for career coach chat (context-aware)
3. `INTERVIEW_QUESTIONS_PROMPT` — Generates technical/behavioral/HR questions from JD
4. `MOCK_INTERVIEW_EVALUATE_PROMPT` — Evaluates candidate answers with score + feedback
5. `COVER_LETTER_PROMPT` — Generates tailored cover letter from resume + JD
6. `SUGGESTIONS_PROMPT` — Detailed improvement suggestions with before/after examples
7. `fillPrompt()` — Template variable replacement helper

---

## Database Schema (in supabase-schema.sql)

6 tables with Row Level Security:
- `profiles` — extends Supabase Auth users (auto-created via trigger)
- `resumes` — uploaded resume files + parsed text
- `analyses` — AI analysis results (scores, skills, suggestions)
- `chat_messages` — AI coach conversation history
- `applications` — job application tracker (Kanban states)
- `saved_jobs` — bookmarked job listings
