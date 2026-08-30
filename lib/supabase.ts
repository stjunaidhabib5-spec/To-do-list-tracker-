import { createClient } from '@supabase/supabase-js';
import type { Task, NewTask, TaskUpdate } from './types';

// ── Singleton Supabase client ────────────────────────────────────────────────
// Both vars are NEXT_PUBLIC_ so they are safely exposed to the browser bundle.
// Real values live in .env.local (dev) and Vercel Environment Variables (prod).

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Connectivity test / Phase 2 verification ─────────────────────────────────
// Fetches all tasks ordered by due date. Call this to verify the DB is reachable.
export async function fetchAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) throw new Error(`fetchAllTasks failed: ${error.message}`);
  return (data ?? []) as Task[];
}

// ── CRUD helpers (used in Phase 4) ───────────────────────────────────────────

export async function createTask(task: NewTask): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw new Error(`createTask failed: ${error.message}`);
  return data as Task;
}

export async function updateTask({ id, ...fields }: TaskUpdate): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateTask failed: ${error.message}`);
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteTask failed: ${error.message}`);
}

export async function toggleTaskCompletion(id: string, is_completed: boolean): Promise<Task> {
  return updateTask({ id, is_completed });
}
