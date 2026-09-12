import type { Metadata } from 'next';
import TaskCalendar from '@/components/TaskCalendar';
import { fetchAllTasks } from '@/lib/supabase';

// Force a fresh server render on every request — prevents stale cached data
// from hiding tasks that were created after the last render.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Calendar — TaskFlow',
  description: 'Visual monthly and weekly calendar view for all your tasks and deadlines.',
};

export default async function CalendarPage() {
  // Live server-side fetch — fresh data on every visit
  const tasks = await fetchAllTasks();

  return (
    <div id="calendar-page" className="max-w-6xl mx-auto px-6 py-10 space-y-6 animate-fade-in-up">
      <header className="space-y-1">
        <h1 className="font-display tracking-wider uppercase text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
          Calendar
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          View all your tasks on a monthly and weekly grid.
        </p>
      </header>

      <TaskCalendar tasks={tasks} />
    </div>
  );
}
