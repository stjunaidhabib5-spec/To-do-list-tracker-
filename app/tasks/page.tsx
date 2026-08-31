'use client';

import { useState, useCallback, useEffect } from 'react';
import TaskCard from '@/components/TaskCard';
import TaskCardSkeleton from '@/components/TaskCardSkeleton';
import TaskFilterBar from '@/components/TaskFilterBar';
import { useToast } from '@/components/ToastProvider';
import { fetchAllTasks, toggleTaskCompletion, deleteTask } from '@/lib/supabase';
import type { Task, Category } from '@/lib/types';

type FilterValue = 'All' | Category;

export default function TasksPage() {
  const [tasks,        setTasks]       = useState<Task[]>([]);
  const [isLoading,    setIsLoading]   = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('All');
  const { showToast } = useToast();

  // ── Initial data fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchAllTasks()
      .then(data => { if (!cancelled) { setTasks(data); setIsLoading(false); } })
      .catch(err  => {
        if (!cancelled) {
          setIsLoading(false);
          showToast(`Failed to load tasks: ${(err as Error).message}`, 'error');
        }
      });
    return () => { cancelled = true; };
    // showToast is stable (useCallback) so this is safe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Optimistic toggle ───────────────────────────────────────────────────────
  const handleToggle = useCallback(async (id: string, current: boolean) => {
    // 1. Flip immediately in local state
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: !current } : t));
    try {
      // 2. Persist to Supabase in background
      await toggleTaskCompletion(id, !current);
    } catch (err) {
      // 3. Roll back on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: current } : t));
      showToast(`Failed to update task: ${(err as Error).message}`, 'error');
    }
  }, [showToast]);

  // ── Optimistic delete ───────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    // 1. Remove from local state immediately
    const removed = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      // 2. Delete from Supabase in background
      await deleteTask(id);
    } catch (err) {
      // 3. Restore on failure
      if (removed) setTasks(prev => [...prev, removed].sort(
        (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      ));
      showToast(`Failed to delete task: ${(err as Error).message}`, 'error');
    }
  }, [tasks, showToast]);

  // ── Derived state ───────────────────────────────────────────────────────────
  const filteredTasks = activeFilter === 'All'
    ? tasks
    : tasks.filter(t => t.category === activeFilter);

  const counts = {
    all:      tasks.length,
    academic: tasks.filter(t => t.category === 'Academic').length,
    skill:    tasks.filter(t => t.category === 'Skill Acquisition').length,
  };

  return (
    <div id="tasks-page" className="max-w-6xl mx-auto px-6 py-10 space-y-6 animate-fade-in-up">

      {/* ── Header ── */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          My Tasks
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          All your Academic and Skill Acquisition tasks in one list.
        </p>
      </header>

      {/* ── Filter Bar ── */}
      <TaskFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      {/* ── Task List ── */}
      {isLoading ? (
        /* Skeleton loading state */
        <div id="task-list-skeleton" className="space-y-3" aria-label="Loading tasks…">
          {Array.from({ length: 4 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div id="task-list" className="space-y-3">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div
          id="tasks-empty"
          className="surface rounded-2xl p-12 flex flex-col items-center justify-center gap-3 min-h-48 text-center"
        >
          <span className="text-4xl">🎉</span>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks in this category'}
          </p>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            {tasks.length === 0
              ? 'Click "Add Task" below to create your first task.'
              : 'Try switching the filter or add a new task.'}
          </p>
        </div>
      )}
    </div>
  );
}
