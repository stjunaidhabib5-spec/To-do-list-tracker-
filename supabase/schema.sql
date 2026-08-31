-- ============================================================
-- TaskFlow — Phase 2: Database Setup Script
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 1. Create the tasks table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  description  TEXT,
  category     TEXT        NOT NULL CHECK (category IN ('Academic', 'Skill Acquisition')),
  due_date     TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Disable Row Level Security (single-user personal app) ─
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- ── 3. Seed data — 8 realistic tasks ────────────────────────
-- Due dates are relative offsets from now() so they stay
-- current regardless of when you run this script.

INSERT INTO public.tasks (title, description, category, due_date, is_completed) VALUES

-- Academic tasks
(
  'PCB Design Draft v1',
  'Complete the first schematic draft for the engineering project PCB. Include power supply section and microcontroller pinout.',
  'Academic',
  now() + interval '2 days',
  false
),
(
  'Submit Engineering Lab Report',
  'Write up and submit the formal lab report for the circuits experiment. Include oscilloscope screenshots and analysis.',
  'Academic',
  now() + interval '4 days',
  false
),
(
  'Club Executive Meeting — Agenda Prep',
  'Prepare agenda items for the next EEE club executive meeting. Include budget proposal and event calendar Q4.',
  'Academic',
  now() + interval '1 day',
  false
),
(
  'Review Lecture Notes — Signals & Systems',
  'Go through weeks 6–8 lecture slides before the midterm. Focus on Fourier transforms and convolution.',
  'Academic',
  now() + interval '6 days',
  true
),
(
  'Group Project — Sprint 1 Demo',
  'Prepare the live demo for the first sprint review. Application must show basic CRUD working end-to-end.',
  'Academic',
  now() + interval '10 days',
  false
),

-- Skill Acquisition tasks
(
  'Solve 5 Codeforces Problems (Div. 2 B/C)',
  'Focus on greedy and binary search problem types. Log solutions to the competitive programming journal.',
  'Skill Acquisition',
  now() + interval '3 days',
  false
),
(
  'Kaggle — Titanic Survival Prediction Submission',
  'Clean the dataset, engineer features, and submit a Random Forest model. Target: top 20% leaderboard.',
  'Skill Acquisition',
  now() + interval '7 days',
  false
),
(
  'Build First n8n Automation Workflow',
  'Create an n8n workflow that reads a Google Sheet and sends a daily Telegram digest. Self-hosted on local machine.',
  'Skill Acquisition',
  now() + interval '14 days',
  false
);

-- ── 4. Verify ────────────────────────────────────────────────
-- After running, you should see 8 rows here:
SELECT id, title, category, due_date, is_completed
FROM public.tasks
ORDER BY due_date ASC;
