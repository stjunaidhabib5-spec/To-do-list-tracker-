# TaskFlow — Personal Task & Calendar Tracker

A centralized, single-user web application for tracking academic deadlines and skill acquisition goals. Built with Next.js 16, Supabase, and FullCalendar.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

---

## ✨ Features

- **Dashboard** — Live stat cards (Total, Pending, Completed, Due This Week) with a full calendar preview
- **Task List** — Filterable by category (Academic / Skill Acquisition) with instant checkbox toggle
- **Calendar** — FullCalendar month/week view with color-coded task events per category
- **Add Task** — Global floating action button (FAB) that opens a slide-in modal form
- **Delete** — Hover-visible trash icon on each task card with optimistic removal
- **Optimistic UI** — Checkbox toggles and deletes feel instant; rollback on error
- **Toast Notifications** — Auto-dismissing banners for success/error on all DB operations
- **Skeleton Loading** — Shimmer placeholders while tasks fetch from Supabase

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, custom CSS design tokens |
| Calendar | FullCalendar v6 (`@fullcalendar/react`) |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## 🚀 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Where to find these:** Supabase Dashboard → Project Settings → API

### 4. Set up the database

Run the SQL script in the Supabase SQL Editor:

```
Copy supabase/schema.sql → paste into:
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
```

This creates the `tasks` table and seeds it with 8 sample tasks.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄 Database Schema

**Table:** `tasks`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `title` | Text | Short task name |
| `description` | Text | Optional notes or links |
| `category` | Text | `'Academic'` or `'Skill Acquisition'` |
| `due_date` | Timestamptz | Due date and time |
| `is_completed` | Boolean | Default `false` |
| `created_at` | Timestamptz | Auto-generated |

---

## ☁️ Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Vercel auto-detects Next.js — no build config needed
4. Add these **Environment Variables** in the Vercel dashboard:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

5. Click **Deploy** — live in ~60 seconds

> ⚠️ **Never commit `.env.local`** — it is gitignored. Always set env vars via the Vercel dashboard.

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Dashboard (Server Component, live stats)
│   ├── tasks/page.tsx        # Task list (Client Component, CRUD)
│   ├── calendar/page.tsx     # Calendar view (Server Component)
│   └── layout.tsx            # Root layout with Navbar + FAB + ToastProvider
├── components/
│   ├── TaskCalendar.tsx      # FullCalendar wrapper (client-side lazy load)
│   ├── TaskCard.tsx          # Task card with toggle + delete
│   ├── TaskCardSkeleton.tsx  # Shimmer loading placeholder
│   ├── TaskFilterBar.tsx     # Category filter pills
│   ├── AddTaskModal.tsx      # Add Task form modal
│   ├── AddTaskFAB.tsx        # Global floating action button
│   ├── ToastProvider.tsx     # Toast notification context + hook
│   ├── StatCard.tsx          # Dashboard stat card
│   └── Navbar.tsx            # Navigation header
├── lib/
│   ├── supabase.ts           # Supabase client + CRUD helpers
│   └── types.ts              # Shared TypeScript interfaces
└── supabase/
    ├── schema.sql            # Database schema + seed data
    └── test-phase4.mjs       # Integration test suite (69 tests)
```

---

## 🧪 Running Tests

```bash
# Phase 2 DB tests — schema + CRUD round-trips (27 tests)
node --env-file=.env.local supabase/test-phase2.mjs

# Phase 4 integration tests — live Supabase + HTTP checks (69 tests)
node --env-file=.env.local supabase/test-phase4.mjs
```

---

## 📄 License

MIT
