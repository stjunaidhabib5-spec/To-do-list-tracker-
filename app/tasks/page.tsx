import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tasks — TaskFlow',
  description: 'Browse, filter, and manage all your Academic and Skill Acquisition tasks.',
};

export default function TasksPage() {
  return (
    <div id="tasks-page" className="max-w-6xl mx-auto px-6 py-10 space-y-6 animate-fade-in-up">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          My Tasks
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          All your Academic and Skill Acquisition tasks in one list.
        </p>
      </header>

      {/* Stub placeholder */}
      <div
        id="tasks-stub"
        className="surface rounded-2xl p-12 flex flex-col items-center justify-center gap-4 min-h-64 text-center"
      >
        <span className="text-5xl">📝</span>
        <p className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
          Task List View
        </p>
        <p className="text-sm max-w-sm" style={{ color: 'var(--foreground-muted)' }}>
          Task cards with category badges, due dates, and completion toggles will be built in Phase 3 once Supabase is connected.
        </p>
        <div className="flex gap-2 mt-2">
          <span className="badge-academic text-xs font-semibold px-3 py-1.5 rounded-full">Academic</span>
          <span className="badge-skill text-xs font-semibold px-3 py-1.5 rounded-full">Skill Acquisition</span>
        </div>
        <span
          className="mt-1 text-xs font-medium px-3 py-1.5 rounded-full"
          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>
    </div>
  );
}
