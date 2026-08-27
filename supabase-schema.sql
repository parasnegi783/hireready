-- ============================================
-- HireReady Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================

-- 1. Profiles table (extends Supabase Auth users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'pro', 'campus')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile when user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Resumes table
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  file_url text,
  parsed_text text,
  file_name text,
  file_size integer,
  created_at timestamptz default now()
);

-- 3. Analyses table
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  resume_id uuid references resumes(id) on delete set null,
  job_description text,
  match_score integer,
  ats_score integer,
  skills_present jsonb default '[]',
  skills_missing jsonb default '[]',
  suggestions jsonb default '[]',
  section_feedback jsonb default '[]',
  full_result jsonb default '{}',
  created_at timestamptz default now()
);

-- 4. Chat messages table
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  analysis_id uuid references analyses(id) on delete set null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- 5. Applications tracker
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  company text not null,
  role text not null,
  status text default 'applied' check (status in ('applied', 'screening', 'interview', 'offer', 'rejected')),
  job_url text,
  match_score integer,
  notes text,
  applied_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Saved jobs
create table if not exists saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  company text,
  location text,
  description text,
  url text,
  salary text,
  match_score integer,
  saved_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- Users can only access their own data
-- ============================================

alter table profiles enable row level security;
alter table resumes enable row level security;
alter table analyses enable row level security;
alter table chat_messages enable row level security;
alter table applications enable row level security;
alter table saved_jobs enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Resumes: users can CRUD their own resumes
create policy "Users can view own resumes" on resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on resumes for insert with check (auth.uid() = user_id);
create policy "Users can delete own resumes" on resumes for delete using (auth.uid() = user_id);

-- Analyses: users can CRUD their own analyses
create policy "Users can view own analyses" on analyses for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on analyses for insert with check (auth.uid() = user_id);
create policy "Users can delete own analyses" on analyses for delete using (auth.uid() = user_id);

-- Chat messages: users can CRUD their own messages
create policy "Users can view own messages" on chat_messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on chat_messages for insert with check (auth.uid() = user_id);

-- Applications: users can CRUD their own applications
create policy "Users can view own applications" on applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications" on applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on applications for update using (auth.uid() = user_id);
create policy "Users can delete own applications" on applications for delete using (auth.uid() = user_id);

-- Saved jobs: users can CRUD their own saved jobs
create policy "Users can view own saved jobs" on saved_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own saved jobs" on saved_jobs for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved jobs" on saved_jobs for delete using (auth.uid() = user_id);

-- ============================================
-- Storage bucket for resume PDFs
-- ============================================
-- Run this separately if needed:
-- insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false);
-- create policy "Users can upload own resumes" on storage.objects for insert with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Users can view own resumes" on storage.objects for select using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
