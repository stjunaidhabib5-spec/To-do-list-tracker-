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

  const greeting = now.getHours() < 12 ? 'Good morning'
    : now.getHours() < 18 ? 'Good afternoon'
    : 'Good evening';

  return (
    <div id="dashboard-page" className="max-w-6xl mx-auto px-6 py-10 space-y-10">

      {/* ── Page Heading ── */}
      <header id="dashboard-header" className="animate-fade-in-up space-y-1">
        <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
          {greeting} 👋
        </p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
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
        className="flex items-center gap-3 animate-fade-in-up"
      >
        <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
          Categories:
        </span>
        <span className="badge-academic text-xs font-semibold px-3 py-1 rounded-full">Academic</span>
        <span className="badge-skill text-xs font-semibold px-3 py-1 rounded-full">Skill Acquisition</span>
      </section>

      {/* ── Calendar preview ── */}
      <section className="animate-fade-in-up">
        <TaskCalendar tasks={tasks} />
      </section>
    </div>
  );
}
