import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar — TaskFlow',
  description: 'Visual monthly and weekly calendar view for all your tasks and deadlines.',
};

export default function CalendarPage() {
  return (
    <div id="calendar-page" className="max-w-6xl mx-auto px-6 py-10 space-y-6 animate-fade-in-up">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          Calendar
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          View all your tasks on a monthly and weekly grid.
        </p>
      </header>

      {/* Stub placeholder */}
      <div
        id="calendar-stub"
        className="surface rounded-2xl p-12 flex flex-col items-center justify-center gap-4 min-h-64 text-center"
      >
        <span className="text-5xl">🗓️</span>
        <p className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
          Full Calendar Integration
        </p>
        <p className="text-sm max-w-sm" style={{ color: 'var(--foreground-muted)' }}>
          React Big Calendar or FullCalendar will be integrated here in Phase 3, displaying live tasks from the database.
        </p>
        <span
          className="mt-2 text-xs font-medium px-3 py-1.5 rounded-full"
          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>
    </div>
  );
}
