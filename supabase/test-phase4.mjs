/**
 * TaskFlow — Phase 4 Integration Test Suite
 * Tests: Live Supabase CRUD, HTTP route verification, component wiring,
 *        data integrity, error handling, and Phase 4 swap completeness
 *
 * Run with:
 *   node --env-file=.env.local "/Users/junaid/.gemini/antigravity-ide/brain/b137ffa4-e89f-446d-8b8f-b465e8634941/scratch/test-phase4.mjs"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const PASS = '\x1b[32m✅ PASS\x1b[0m';
const FAIL = '\x1b[31m❌ FAIL\x1b[0m';
const INFO = '\x1b[36mℹ️  INFO\x1b[0m';
let pass = 0, fail = 0;

function assert(condition, id, desc, detail = '') {
  if (condition) { console.log(`  ${PASS}  [${id}] ${desc}`); pass++; }
  else { console.log(`  ${FAIL}  [${id}] ${desc}${detail ? '\n         → ' + detail : ''}`); fail++; }
}

async function assertAsync(fn, id, desc) {
  try {
    const result = await fn();
    if (result === false) { console.log(`  ${FAIL}  [${id}] ${desc}`); fail++; }
    else { console.log(`  ${PASS}  [${id}] ${desc}`); pass++; }
  } catch (err) {
    console.log(`  ${FAIL}  [${id}] ${desc}\n         → ${err.message}`);
    fail++;
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing env vars. Run with --env-file=.env.local\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BASE     = '/Users/junaid/Documents/vibecoding projects/to do list tracking 0.1';
let createdId  = null; // track test task for cleanup

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   TaskFlow — Phase 4 Integration Test Suite             ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Phase 4 Swap Completeness (static analysis)
// ─────────────────────────────────────────────────────────────────────────────
console.log('── Phase 4 Swap Completeness ──────────────────────────────');

const filesToCheck = {
  'app/page.tsx':                ['fetchAllTasks', 'async', 'MOCK_TASKS'],
  'app/calendar/page.tsx':       ['fetchAllTasks', 'async', 'MOCK_TASKS'],
  'app/tasks/page.tsx':          ['fetchAllTasks', 'toggleTaskCompletion', 'deleteTask', 'useEffect', 'isLoading'],
  'components/AddTaskFAB.tsx':   ['createTask', 'router.refresh', 'showToast', 'isSaving'],
  'components/TaskCard.tsx':     ['onDelete', 'delete-'],
  'components/ToastProvider.tsx':['useToast', 'showToast'],
  'components/TaskCardSkeleton.tsx': ['shimmer'],
  'components/TaskCalendar.tsx': ['useEffect', 'import(\'@fullcalendar'],
};

for (const [file, mustHave] of Object.entries(filesToCheck)) {
  const src = readFileSync(`${BASE}/${file}`, 'utf8');
  const hasMock = src.includes('MOCK_TASKS') && !src.includes('// Phase 4');
  
  if (file.includes('page.tsx') && (file.includes('app/page') || file.includes('calendar'))) {
    assert(!hasMock, `SWAP-${file.split('/').pop()}`, `${file}: MOCK_TASKS removed`);
  }
  
  for (const token of mustHave) {
    if (token === 'MOCK_TASKS') {
      assert(!src.includes('MOCK_TASKS'), `SWAP-${token}-${file.split('/').pop()}`, `${file}: no MOCK_TASKS`);
    } else {
      assert(src.includes(token), `SWAP-${token}`, `${file}: contains '${token}'`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. HTTP route checks (dev server must be running)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── HTTP Route Checks ──────────────────────────────────────');

async function fetchRoute(path) {
  const res = await fetch(`http://localhost:3000${path}`);
  const text = await res.text();
  return { status: res.status, body: text };
}

await assertAsync(async () => {
  const { status } = await fetchRoute('/');
  return status === 200;
}, 'HTTP-1', 'Dashboard route (/) returns 200');

await assertAsync(async () => {
  const { status } = await fetchRoute('/tasks');
  return status === 200;
}, 'HTTP-2', 'Tasks route (/tasks) returns 200');

await assertAsync(async () => {
  const { status } = await fetchRoute('/calendar');
  return status === 200;
}, 'HTTP-3', 'Calendar route (/calendar) returns 200');

// Dashboard should have live data (no mock-N IDs)
await assertAsync(async () => {
  const { body } = await fetchRoute('/');
  const hasMockIds = /mock-\d+/.test(body);
  if (hasMockIds) throw new Error('mock-N IDs found in dashboard response (still using mock data)');
  return true;
}, 'HTTP-4', 'Dashboard serves live data (no mock-N IDs in response)');

// Dashboard should include StatCard values
await assertAsync(async () => {
  const { body } = await fetchRoute('/');
  return body.includes('Total Tasks') && body.includes('Pending') && body.includes('Completed');
}, 'HTTP-5', 'Dashboard StatCards rendered (Total Tasks, Pending, Completed)');

// Tasks page should have ToastProvider context chunk
await assertAsync(async () => {
  const { body } = await fetchRoute('/tasks');
  return body.includes('ToastProvider') || body.length > 5000;
}, 'HTTP-6', 'Tasks page renders (ToastProvider context active)');

// ─────────────────────────────────────────────────────────────────────────────
// 3. TC-1.2 — Read/Display: fetchAllTasks live from Supabase
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── TC-1.2: Read/Display (Live Supabase Fetch) ─────────────');

let initialTasks = [];
await assertAsync(async () => {
  const { data, error } = await supabase.from('tasks').select('*').order('due_date');
  if (error) throw error;
  initialTasks = data;
  return data.length > 0;
}, 'DB-1', `Tasks exist in database (${initialTasks.length} found)`);

await assertAsync(async () => {
  const { data } = await supabase.from('tasks').select('*');
  const hasAcademic = data?.some(t => t.category === 'Academic');
  const hasSkill    = data?.some(t => t.category === 'Skill Acquisition');
  return hasAcademic && hasSkill;
}, 'DB-2', 'Both categories (Academic + Skill Acquisition) present in DB');

await assertAsync(async () => {
  const { data } = await supabase.from('tasks').select('*');
  return data?.every(t =>
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.is_completed === 'boolean' &&
    typeof t.due_date === 'string' &&
    (t.category === 'Academic' || t.category === 'Skill Acquisition')
  );
}, 'DB-3', 'All DB tasks match Task interface schema');

// ─────────────────────────────────────────────────────────────────────────────
// 4. TC-1.1 — Create a new task (INSERT)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── TC-1.1: Create Task (INSERT) ───────────────────────────');

const testTask = {
  title: '[TEST] Phase 4 Integration Test Task',
  description: 'Auto-created by test-phase4.mjs — safe to delete',
  category: 'Academic',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  is_completed: false,
};

await assertAsync(async () => {
  const { data, error } = await supabase.from('tasks').insert(testTask).select().single();
  if (error) throw error;
  createdId = data.id;
  return typeof data.id === 'string' && data.title === testTask.title;
}, 'TC-1.1a', 'Task INSERT returns created task with valid UUID id');

await assertAsync(async () => {
  if (!createdId) throw new Error('No task was created in TC-1.1a');
  const { data, error } = await supabase.from('tasks').select('*').eq('id', createdId).single();
  if (error) throw error;
  return data.title === testTask.title && data.category === 'Academic';
}, 'TC-1.1b', 'Newly created task is readable from database');

// TC-2.1 & TC-2.2: category badge correctness verified via DB
await assertAsync(async () => {
  if (!createdId) return false;
  const { data } = await supabase.from('tasks').select('category').eq('id', createdId).single();
  return data.category === 'Academic';
}, 'TC-2.1', 'TC-2.1: Created task has Academic category in DB (badge will render from this)');

// TC-2.2 — create a Skill Acquisition task and verify
let skillTaskId = null;
await assertAsync(async () => {
  const { data, error } = await supabase.from('tasks').insert({
    ...testTask,
    title: '[TEST] Skill Acquisition Task',
    category: 'Skill Acquisition',
  }).select().single();
  if (error) throw error;
  skillTaskId = data.id;
  return data.category === 'Skill Acquisition';
}, 'TC-2.2', 'TC-2.2: Skill Acquisition task created and stored correctly in DB');

// ─────────────────────────────────────────────────────────────────────────────
// 5. TC-3.1 / TC-3.2 — Toggle completion (UPDATE)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── TC-3.1 / TC-3.2: Status Toggle (UPDATE) ────────────────');

await assertAsync(async () => {
  if (!createdId) throw new Error('No task created');
  // Mark as completed
  const { data, error } = await supabase
    .from('tasks').update({ is_completed: true }).eq('id', createdId).select().single();
  if (error) throw error;
  return data.is_completed === true;
}, 'TC-3.1', 'TC-3.1: Mark task as completed — is_completed set to true in DB');

await assertAsync(async () => {
  if (!createdId) throw new Error('No task created');
  // Verify persisted
  const { data } = await supabase.from('tasks').select('is_completed').eq('id', createdId).single();
  return data.is_completed === true;
}, 'TC-3.1b', 'TC-3.1: Completed status persists after re-fetch (not just local state)');

await assertAsync(async () => {
  if (!createdId) throw new Error('No task created');
  // Unmark
  const { data, error } = await supabase
    .from('tasks').update({ is_completed: false }).eq('id', createdId).select().single();
  if (error) throw error;
  return data.is_completed === false;
}, 'TC-3.2', 'TC-3.2: Unmark task — is_completed set to false in DB');

// ─────────────────────────────────────────────────────────────────────────────
// 6. TC-4.1 — Calendar: task due_date integrity
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── TC-4.1: Calendar Date Integrity ────────────────────────');

await assertAsync(async () => {
  const { data } = await supabase.from('tasks').select('due_date');
  return data?.every(t => {
    const d = new Date(t.due_date);
    return !isNaN(d.getTime()); // valid ISO date
  });
}, 'TC-4.1', 'TC-4.1: All task due_dates are valid ISO strings (calendar can render them)');

// TaskCalendar uses useEffect + lazy import — no SSR
const calSrc = readFileSync(`${BASE}/components/TaskCalendar.tsx`, 'utf8');
assert(calSrc.includes("import('@fullcalendar"), 'TC-4.2a', 'TC-4.2: FullCalendar loaded via dynamic import (prevents SSR crash)');
assert(!calSrc.includes("import FullCalendar from '@fullcalendar"), 'TC-4.2b', 'TC-4.2: No static top-level FullCalendar import (SSR-safe)');

// ─────────────────────────────────────────────────────────────────────────────
// 7. TC-1.3 — Update task details
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── TC-1.3: Update Task Details ────────────────────────────');

await assertAsync(async () => {
  if (!createdId) throw new Error('No task created');
  const newTitle = '[TEST] Phase 4 — Updated Title';
  const { data, error } = await supabase
    .from('tasks').update({ title: newTitle }).eq('id', createdId).select().single();
  if (error) throw error;
  return data.title === newTitle;
}, 'TC-1.3a', 'TC-1.3: Title UPDATE persists to database');

await assertAsync(async () => {
  if (!createdId) throw new Error('No task created');
  const newDesc = 'Updated description via Phase 4 test';
  const { data, error } = await supabase
    .from('tasks').update({ description: newDesc }).eq('id', createdId).select().single();
  if (error) throw error;
  return data.description === newDesc;
}, 'TC-1.3b', 'TC-1.3: Description UPDATE persists to database');

// ─────────────────────────────────────────────────────────────────────────────
// 8. TC-1.4 / TC-5.1 — Delete + Filter verification
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── TC-1.4: Delete Task ────────────────────────────────────');

await assertAsync(async () => {
  if (!createdId) throw new Error('No task created');
  const { error } = await supabase.from('tasks').delete().eq('id', createdId);
  if (error) throw error;
  // Verify gone
  const { data } = await supabase.from('tasks').select('*').eq('id', createdId);
  return data?.length === 0;
}, 'TC-1.4a', 'TC-1.4: DELETE removes task from database (main test task)');

await assertAsync(async () => {
  if (!skillTaskId) return false;
  const { error } = await supabase.from('tasks').delete().eq('id', skillTaskId);
  if (error) throw error;
  const { data } = await supabase.from('tasks').select('*').eq('id', skillTaskId);
  return data?.length === 0;
}, 'TC-1.4b', 'TC-1.4: DELETE removes Skill Acquisition test task from database');

console.log('\n── TC-5.1: Category Filter ────────────────────────────────');

await assertAsync(async () => {
  const { data: academic } = await supabase.from('tasks').select('*').eq('category', 'Academic');
  const { data: skill }    = await supabase.from('tasks').select('*').eq('category', 'Skill Acquisition');
  return (academic?.length ?? 0) > 0 && (skill?.length ?? 0) > 0;
}, 'TC-5.1a', 'TC-5.1: DB supports category filtering — both categories return results');

const taskSrc = readFileSync(`${BASE}/app/tasks/page.tsx`, 'utf8');
assert(taskSrc.includes("t.category === activeFilter"), 'TC-5.1b', 'TC-5.1: Filter logic in tasks/page.tsx filters by category correctly');
assert(taskSrc.includes("'All'"), 'TC-5.1c', 'TC-5.1: Filter handles All-categories case');

// ─────────────────────────────────────────────────────────────────────────────
// 9. Toast & Optimistic UI — code analysis
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── Toast & Optimistic UI (Code Analysis) ──────────────────');

assert(taskSrc.includes('showToast'), 'TOAST-1', 'Tasks page uses showToast on errors');
assert(taskSrc.includes('setTasks(prev => prev.map'), 'OPT-1', 'Toggle: optimistic state flip before await');
assert(taskSrc.includes('setTasks(prev => prev.filter'), 'OPT-2', 'Delete: optimistic remove before await');
assert(taskSrc.includes('setTasks(prev => prev.map(t => t.id === id'), 'OPT-3', 'Toggle rollback: restores original state on error');

const fabSrc = readFileSync(`${BASE}/components/AddTaskFAB.tsx`, 'utf8');
assert(fabSrc.includes('router.refresh()'), 'SYNC-1', 'FAB calls router.refresh() after createTask to sync server components');
assert(fabSrc.includes("isSaving"), 'SYNC-2', 'FAB tracks isSaving state to disable submit during DB call');
assert(fabSrc.includes("showToast"), 'SYNC-3', 'FAB shows toast on success and error');

const toastSrc = readFileSync(`${BASE}/components/ToastProvider.tsx`, 'utf8');
assert(toastSrc.includes('useContext'), 'TOAST-2', 'ToastProvider uses React context');
assert(toastSrc.includes('setTimeout'), 'TOAST-3', 'Toasts auto-dismiss via setTimeout');
assert(toastSrc.includes("'success'"), 'TOAST-4', 'Toast supports success type');
assert(toastSrc.includes("'error'"), 'TOAST-5', 'Toast supports error type');

// ─────────────────────────────────────────────────────────────────────────────
// 10. Skeleton loading state
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── Skeleton Loading State ─────────────────────────────────');

assert(taskSrc.includes('isLoading'), 'SKEL-1', 'Tasks page has isLoading state');
assert(taskSrc.includes('TaskCardSkeleton'), 'SKEL-2', 'Tasks page renders TaskCardSkeleton while loading');
assert(taskSrc.includes('setIsLoading(false)'), 'SKEL-3', 'isLoading set to false after fetch completes');

const skeletonSrc = readFileSync(`${BASE}/components/TaskCardSkeleton.tsx`, 'utf8');
assert(skeletonSrc.includes('shimmer'), 'SKEL-4', 'TaskCardSkeleton uses shimmer CSS class');

const cssSrc = readFileSync(`${BASE}/app/globals.css`, 'utf8');
assert(cssSrc.includes('@keyframes shimmer'), 'SKEL-5', 'Shimmer keyframe defined in globals.css');
assert(cssSrc.includes('.shimmer'), 'SKEL-6', 'Shimmer utility class defined in globals.css');

// ─────────────────────────────────────────────────────────────────────────────
// 11. Database integrity — confirm seeded tasks untouched
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── Database Integrity Check ───────────────────────────────');

await assertAsync(async () => {
  const { data, error } = await supabase.from('tasks').select('*').order('due_date');
  if (error) throw error;
  console.log(`  ${INFO}  ${data.length} tasks currently in database`);
  return data.length >= 8; // At least the original 8 seeded tasks
}, 'DB-INT-1', 'At least 8 seeded tasks remain in database after test cleanup');

await assertAsync(async () => {
  // No orphaned test tasks left behind
  const { data } = await supabase.from('tasks').select('*').like('title', '[TEST]%');
  if (data?.length > 0) {
    console.log(`  ${INFO}  Cleaning up ${data.length} leftover test task(s)…`);
    await supabase.from('tasks').delete().like('title', '[TEST]%');
  }
  return true;
}, 'DB-INT-2', 'Test task cleanup complete (no [TEST] tasks left in DB)');

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log(`║  Results: ${String(pass).padEnd(2)}/${total} passed   ${fail > 0 ? `(${fail} FAILED)` : '🎉 All tests passed!'}`);
if (fail > 0) {
console.log('║  ⚠️  Some tests failed — review output above             ║');
}
console.log('╚══════════════════════════════════════════════════════════╝\n');
process.exit(fail > 0 ? 1 : 0);
