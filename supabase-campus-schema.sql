-- ============================================
-- HireReady Campus Module Schema
-- Run this in Supabase SQL Editor AFTER the base schema
-- ============================================

-- 1. Add role + campus fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'student' CHECK (role IN ('student', 'tpo'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college_id uuid;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS branch text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cgpa numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS batch_year integer;

-- 2. Colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  domain text,
  logo_url text,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'campus_basic', 'campus_pro', 'campus_enterprise')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Add FK from profiles to colleges
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_college_id_fkey'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_college_id_fkey FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Placement drives
CREATE TABLE IF NOT EXISTS drives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  company_name text NOT NULL,
  role_title text NOT NULL,
  description text,
  min_cgpa numeric DEFAULT 0,
  allowed_branches text[] DEFAULT '{}',
  batch_year integer,
  deadline timestamptz,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Drive applications
CREATE TABLE IF NOT EXISTS drive_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id uuid REFERENCES drives(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interview', 'selected', 'rejected')),
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(drive_id, student_id)
);

-- 5. AI interview sessions
CREATE TABLE IF NOT EXISTS ai_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id uuid REFERENCES drives(id) ON DELETE CASCADE,
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  type text DEFAULT 'placement' CHECK (type IN ('placement', 'admission')),
  config jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- 6. Interview responses (per student per question)
CREATE TABLE IF NOT EXISTS interview_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES ai_interviews(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_index integer NOT NULL,
  question_text text NOT NULL,
  answer_text text,
  ai_score integer,
  ai_feedback jsonb DEFAULT '{}',
  time_taken_seconds integer,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(interview_id, student_id, question_index)
);

-- 7. Interview proctoring logs
CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES ai_interviews(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  overall_score integer,
  total_questions integer,
  tab_switches integer DEFAULT 0,
  fullscreen_exits integer DEFAULT 0,
  proctoring_flags jsonb DEFAULT '[]',
  ai_recommendation text CHECK (ai_recommendation IN ('strong', 'moderate', 'weak')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(interview_id, student_id)
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Colleges: anyone can read (to join), TPO of college can update
CREATE POLICY "Anyone can view colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "TPO can insert colleges" ON colleges FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "TPO can update own college" ON colleges FOR UPDATE USING (auth.uid() = created_by);

-- Drives: visible to same college members
CREATE POLICY "College members can view drives" ON drives FOR SELECT
  USING (college_id IN (SELECT college_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "TPO can create drives" ON drives FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "TPO can update own drives" ON drives FOR UPDATE
  USING (auth.uid() = created_by);
CREATE POLICY "TPO can delete own drives" ON drives FOR DELETE
  USING (auth.uid() = created_by);

-- Drive applications: students see own, TPO sees all for their college drives
CREATE POLICY "Students can view own applications" ON drive_applications FOR SELECT
  USING (auth.uid() = student_id);
CREATE POLICY "TPO can view drive applications" ON drive_applications FOR SELECT
  USING (drive_id IN (SELECT id FROM drives WHERE created_by = auth.uid()));
CREATE POLICY "Students can apply" ON drive_applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "TPO can update application status" ON drive_applications FOR UPDATE
  USING (drive_id IN (SELECT id FROM drives WHERE created_by = auth.uid()));

-- AI interviews: college-scoped
CREATE POLICY "College members can view interviews" ON ai_interviews FOR SELECT
  USING (college_id IN (SELECT college_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "TPO can create interviews" ON ai_interviews FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "TPO can update interviews" ON ai_interviews FOR UPDATE
  USING (auth.uid() = created_by);

-- Interview responses: students see own, TPO sees for their interviews
CREATE POLICY "Students see own responses" ON interview_responses FOR SELECT
  USING (auth.uid() = student_id);
CREATE POLICY "TPO sees interview responses" ON interview_responses FOR SELECT
  USING (interview_id IN (SELECT id FROM ai_interviews WHERE created_by = auth.uid()));
CREATE POLICY "Students can insert responses" ON interview_responses FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Interview sessions: same as responses
CREATE POLICY "Students see own sessions" ON interview_sessions FOR SELECT
  USING (auth.uid() = student_id);
CREATE POLICY "TPO sees interview sessions" ON interview_sessions FOR SELECT
  USING (interview_id IN (SELECT id FROM ai_interviews WHERE created_by = auth.uid()));
CREATE POLICY "Students can insert sessions" ON interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own sessions" ON interview_sessions FOR UPDATE
  USING (auth.uid() = student_id);
