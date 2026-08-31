'use client';

import { useEffect, useRef } from 'react';
import type { NewTask, Category } from '@/lib/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: NewTask) => void | Promise<void>;
  isSaving?: boolean;
}

const CATEGORIES: Category[] = ['Academic', 'Skill Acquisition'];

// Minimum datetime string for the datetime-local input (right now)
function nowIsoLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function AddTaskModal({ isOpen, onClose, onSubmit, isSaving = false }: AddTaskModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title on open; trap Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => titleRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(timer); document.removeEventListener('keydown', onKey); };
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const task: NewTask = {
      title: (data.get('title') as string).trim(),
      description: ((data.get('description') as string) || '').trim() || null,
      category: data.get('category') as Category,
      due_date: new Date(data.get('due_date') as string).toISOString(),
      is_completed: false,
    };
    onSubmit(task);
    form.reset();
    onClose();
  }

  return (
    /* Backdrop */
    <div
      id="add-task-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Panel */}
      <div
        id="add-task-modal"
        className="surface rounded-2xl w-full max-w-md animate-fade-in-up"
        style={{ boxShadow: 'var(--glass-shadow)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2
            id="modal-title"
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            ✏️ Add New Task
          </h2>
          <button
            id="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--foreground-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-subtle)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="task-title"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              ref={titleRef}
              id="task-title"
              name="title"
              type="text"
              required
              placeholder="e.g. Solve 5 Codeforces problems"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150"
              style={{
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="task-description"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              rows={3}
              placeholder="Optional notes, links, or requirements…"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none transition-all duration-150"
              style={{
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label
              htmlFor="task-category"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="task-category"
              name="category"
              required
              defaultValue="Academic"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150 cursor-pointer"
              style={{
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="task-due-date"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Due Date &amp; Time <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="task-due-date"
              name="due_date"
              type="datetime-local"
              required
              min={nowIsoLocal()}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150"
              style={{
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                colorScheme: 'dark',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              id="modal-cancel"
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer"
              style={{
                background: 'var(--surface-subtle)',
                color: 'var(--foreground-muted)',
                border: '1px solid var(--border)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="modal-submit"
              disabled={isSaving}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-150"
              style={{
                background: 'var(--accent)',
                opacity: isSaving ? 0.65 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!isSaving) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
            >
              {isSaving ? 'Saving…' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
