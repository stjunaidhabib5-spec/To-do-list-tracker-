import StatCard from '@/components/StatCard';
import TaskCalendar from '@/components/TaskCalendar';
import { fetchAllTasks } from '@/lib/supabase';

export default async function DashboardPage() {
  // ── Live server-side fetch ─────────────────────────────────────────────────
  // Phase 4: runs on every page visit (Server Component — no caching by default)
  const tasks = await fetchAllTasks();

  const now         = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const totalTasks     = tasks.length;
  const pendingTasks   = tasks.filter(t => !t.is_completed).length;
  const completedTasks = tasks.filter(t =>  t.is_completed).length;
  const dueThisWeek    = tasks.filter(t => {
    const due = new Date(t.due_date);
    return !t.is_completed && due >= now && due <= weekFromNow;
  }).length;

  const STAT_CARDS = [
    { id: 'stat-total',     title: 'Total Tasks',   value: totalTasks,     icon: '📋', accentVar: '--accent',   delay: 50  },
    { id: 'stat-pending',   title: 'Pending',        value: pendingTasks,   icon: '⏳', accentVar: '--academic', delay: 100 },
    { id: 'stat-completed', title: 'Completed',      value: completedTasks, icon: '✅', accentVar: '--skill',    delay: 150 },
    { id: 'stat-upcoming',  title: 'Due This Week',  value: dueThisWeek,    icon: '📅', accentVar: '--accent',   delay: 200 },
  ] as const;

  const hour = now.getHours();
  const greeting = hour < 12
    ? 'Good morning ☀️'
    : hour < 17
    ? 'Good afternoon 🌤️'
    : 'Good evening 🌙';

  return (
    <div id="dashboard-page" className="max-w-6xl mx-auto px-6 py-10 space-y-10">

      {/* ── Page Heading ── */}
      <header id="dashboard-header" className="animate-fade-in-up space-y-1">
        <p className="text-slate-600 dark:text-slate-200 font-medium text-sm">
          {greeting}
        </p>
        <h1 className="text-slate-900 dark:text-white font-bold text-3xl tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-300 text-sm font-normal mt-1">
          Your tasks and milestones, all in one place.
        </p>
      </header>

      {/* ── Stat Cards ── */}
      <section
        id="dashboard-stats"
        aria-label="Task statistics"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger"
      >
        {STAT_CARDS.map(card => (
          <StatCard key={card.id} {...card} />
        ))}
      </section>

      {/* ── Category Pills ── */}
      <section
        id="dashboard-categories"
        aria-label="Task categories"
        className="flex items-center gap-3 animate-fade-in-up flex-wrap"
      >
        <span className="text-slate-500 dark:text-slate-300 font-semibold tracking-wider text-xs uppercase">
          Categories
        </span>

        {/* Academic pill */}
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border shadow-sm text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-700">
          {/* Graduation cap icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          Academic
        </span>

        {/* Skill Acquisition pill */}
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border shadow-sm text-purple-600 dark:text-purple-400 border-slate-200 dark:border-slate-700">
          {/* Zap / lightning icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Skill Acquisition
        </span>
      </section>

      {/* ── Calendar preview ── */}
      <section className="animate-fade-in-up">
        <TaskCalendar tasks={tasks} />
      </section>
    </div>
  );
}
