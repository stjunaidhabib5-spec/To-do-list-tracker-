// ── Mock task data for Phase 3 UI development ────────────────────────────────
// These match the exact structure of lib/types.ts → Task.
// In Phase 4, replace every import of MOCK_TASKS with `await fetchAllTasks()`.

import type { Task } from './types';

// Compute dates relative to "now" at module load time so the calendar always
// shows tasks in the current/upcoming weeks regardless of when it runs.
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(11, 0, 0, 0); // 11:00 AM
  return d.toISOString();
}

export const MOCK_TASKS: Task[] = [
  // ── Academic ────────────────────────────────────────────────
  {
    id: 'mock-1',
    title: 'Club Executive Meeting — Agenda Prep',
    description:
      'Prepare agenda items for the next EEE club executive meeting. Include budget proposal and event calendar Q4.',
    category: 'Academic',
    due_date: daysFromNow(1),
    is_completed: false,
    created_at: daysFromNow(-5),
  },
  {
    id: 'mock-2',
    title: 'PCB Design Draft v1',
    description:
      'Complete the first schematic draft for the engineering project PCB. Include power supply section and microcontroller pinout.',
    category: 'Academic',
    due_date: daysFromNow(2),
    is_completed: false,
    created_at: daysFromNow(-4),
  },
  {
    id: 'mock-3',
    title: 'Submit Engineering Lab Report',
    description:
      'Write up and submit the formal lab report for the circuits experiment. Include oscilloscope screenshots and analysis.',
    category: 'Academic',
    due_date: daysFromNow(4),
    is_completed: false,
    created_at: daysFromNow(-3),
  },
  {
    id: 'mock-4',
    title: 'Review Lecture Notes — Signals & Systems',
    description:
      'Go through weeks 6–8 lecture slides before the midterm. Focus on Fourier transforms and convolution.',
    category: 'Academic',
    due_date: daysFromNow(6),
    is_completed: true,
    created_at: daysFromNow(-7),
  },
  {
    id: 'mock-5',
    title: 'Group Project — Sprint 1 Demo',
    description:
      'Prepare the live demo for the first sprint review. Application must show basic CRUD working end-to-end.',
    category: 'Academic',
    due_date: daysFromNow(10),
    is_completed: false,
    created_at: daysFromNow(-2),
  },

  // ── Skill Acquisition ────────────────────────────────────────
  {
    id: 'mock-6',
    title: 'Solve 5 Codeforces Problems (Div. 2 B/C)',
    description:
      'Focus on greedy and binary search problem types. Log solutions to the competitive programming journal.',
    category: 'Skill Acquisition',
    due_date: daysFromNow(3),
    is_completed: false,
    created_at: daysFromNow(-6),
  },
  {
    id: 'mock-7',
    title: 'Kaggle — Titanic Survival Prediction Submission',
    description:
      'Clean the dataset, engineer features, and submit a Random Forest model. Target: top 20% leaderboard.',
    category: 'Skill Acquisition',
    due_date: daysFromNow(7),
    is_completed: false,
    created_at: daysFromNow(-1),
  },
  {
    id: 'mock-8',
    title: 'Build First n8n Automation Workflow',
    description:
      'Create an n8n workflow that reads a Google Sheet and sends a daily Telegram digest. Self-hosted on local machine.',
    category: 'Skill Acquisition',
    due_date: daysFromNow(14),
    is_completed: false,
    created_at: daysFromNow(-3),
  },
];
