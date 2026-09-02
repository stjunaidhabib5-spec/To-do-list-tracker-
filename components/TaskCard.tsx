'use client';

import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, current: boolean) => void;
  onDelete?: (id: string) => void;
}

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isOverdue(iso: string, isCompleted: boolean): boolean {
  return !isCompleted && new Date(iso) < new Date();
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const overdue = isOverdue(task.due_date, task.is_completed);
  const isAcademic = task.category === 'Academic';

  return (
    <div
      id={`task-card-${task.id}`}
      className="surface rounded-2xl p-5 flex items-start gap-4 group"
      style={{
        opacity: task.is_completed ? 0.65 : 1,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow-hover)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)';
      }}
    >
      {/* ── Checkbox ── */}
      <button
        id={`toggle-${task.id}`}
        aria-label={task.is_completed ? 'Mark as pending' : 'Mark as completed'}
        onClick={() => onToggle(task.id, task.is_completed)}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer"
        style={{
          borderColor: task.is_completed ? 'var(--accent)' : 'var(--foreground-muted)',
          background: task.is_completed ? 'var(--accent)' : 'transparent',
        }}
      >
        {task.is_completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <p
            className="text-sm font-semibold leading-snug"
            style={{
              color: 'var(--foreground)',
              textDecoration: task.is_completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </p>
          {/* Category badge */}
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
              isAcademic ? 'badge-academic' : 'badge-skill'
            }`}
          >
            {task.category}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {task.description}
          </p>
        )}

        {/* Due date */}
        <p
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: overdue ? '#ef4444' : 'var(--foreground-muted)' }}
        >
          <span aria-hidden="true">{overdue ? '⚠️' : '📅'}</span>
          {overdue ? 'Overdue · ' : ''}
          {formatDueDate(task.due_date)}
        </p>
      </div>

      {/* ── Delete button (visible on hover) ── */}
      {onDelete && (
        <button
          id={`delete-${task.id}`}
          aria-label={`Delete task: ${task.title}`}
          onClick={() => onDelete(task.id)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
          style={{ color: '#ef4444' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          title="Delete task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
