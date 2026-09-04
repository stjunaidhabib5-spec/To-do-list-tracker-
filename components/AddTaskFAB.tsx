'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AddTaskModal from './AddTaskModal';
import { useToast } from './ToastProvider';
import { createTask } from '@/lib/supabase';
import type { NewTask } from '@/lib/types';

export default function AddTaskFAB() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router    = useRouter();
  const { showToast } = useToast();

  const open  = useCallback(() => setIsOpen(true),  []);
  const close = useCallback(() => setIsOpen(false), []);

  async function handleSubmit(task: NewTask) {
    setIsSaving(true);
    try {
      const createdTask = await createTask(task);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tasks-updated', { detail: createdTask }));
      }
      close();
      showToast('Task added! ✨', 'success');
      // Re-run Server Components on the current page so the task list refreshes
      router.refresh();
    } catch (err) {
      showToast(`Failed to create task: ${(err as Error).message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="add-task-fab"
        onClick={open}
        aria-label="Add new task"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition-all duration-200 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.03)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(99,102,241,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)';
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Task
      </button>

      {/* Modal — submit button disabled while saving */}
      <AddTaskModal isOpen={isOpen} onClose={close} onSubmit={handleSubmit} isSaving={isSaving} />
    </>
  );
}
