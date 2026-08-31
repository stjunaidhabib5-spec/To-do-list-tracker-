'use client';

// FullCalendar requires 'use client' and must NOT be SSR-rendered.
// The DayTableView error occurs when Next.js tries to render FC server-side or
// when plugins are dynamically imported inside the component state.
// Using dynamic import with ssr:false fully prevents this.
import dynamic from 'next/dynamic';
import type { Task } from '@/lib/types';
import type { ComponentType } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface InnerProps {
  tasks: Task[];
}

// Dynamically import FullCalendar with SSR disabled — fixes DayTableView SSR crash in Next.js 16
// The loader function gives TypeScript a concrete module path it can resolve.
const FullCalendarNoSSR = dynamic<InnerProps>(
  async () => {
    const mod = await import('./FullCalendarInner');
    return mod.default as ComponentType<InnerProps>;
  },
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center min-h-64"
        style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}
      >
        Loading calendar…
      </div>
    ),
  }
);

interface TaskCalendarProps {
  tasks: Task[];
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  return (
    <ErrorBoundary>
      <div id="task-calendar" className="task-calendar-wrapper surface rounded-2xl p-4 md:p-6">
        <FullCalendarNoSSR tasks={tasks} />
      </div>
    </ErrorBoundary>
  );
}
