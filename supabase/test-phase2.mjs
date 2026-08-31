/**
 * TaskFlow — Phase 2 Test Runner
 * Tests: TC-1.2 (Read tasks), TC-2.1/2.2 (Categories), TC-3.1/3.2 (is_completed schema)
 * Run with: node --env-file=.env.local supabase/test-phase2.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PASS = '\x1b[32m✅ PASS\x1b[0m';
const FAIL = '\x1b[31m❌ FAIL\x1b[0m';
let passCount = 0;
let failCount = 0;

function assert(condition, testId, description, detail = '') {
  if (condition) {
    console.log(`  ${PASS}  [${testId}] ${description}`);
    passCount++;
  } else {
    console.log(`  ${FAIL}  [${testId}] ${description}${detail ? `\n         → ${detail}` : ''}`);
    failCount++;
  }
}

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   TaskFlow — Phase 2 Test Suite                     ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // ── Pre-flight: env vars ─────────────────────────────────────
  console.log('── Pre-flight Checks ──────────────────────────────────');
  assert(!!SUPABASE_URL && SUPABASE_URL !== 'NEXT_PUBLIC_SUPABASE_URL',
    'ENV-1', 'NEXT_PUBLIC_SUPABASE_URL is set');
  assert(!!SUPABASE_KEY && SUPABASE_KEY !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ENV-2', 'NEXT_PUBLIC_SUPABASE_ANON_KEY is set');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('\n  Aborting — missing env vars.\n');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // ── TC-DB-1: Connectivity ────────────────────────────────────
  console.log('\n── Database Connectivity ──────────────────────────────');
  let tasks = [];
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    assert(!error, 'TC-DB-1', 'Supabase connection successful', error?.message);
    tasks = data ?? [];
  } catch (err) {
    assert(false, 'TC-DB-1', 'Supabase connection successful', err.message);
    process.exit(1);
  }

  // ── TC-1.2: Read / Display tasks ────────────────────────────
  console.log('\n── TC-1.2: Read / Display Tasks ───────────────────────');
  assert(tasks.length > 0, 'TC-1.2a', `Tasks exist in database (found ${tasks.length})`);
  assert(tasks.length === 8, 'TC-1.2b', `Exactly 8 seed tasks present (found ${tasks.length})`);

  // ── Schema columns check ─────────────────────────────────────
  console.log('\n── Schema Integrity ───────────────────────────────────');
  const required = ['id', 'title', 'description', 'category', 'due_date', 'is_completed', 'created_at'];
  if (tasks.length > 0) {
    const sample = tasks[0];
    for (const col of required) {
      assert(col in sample, `SCHEMA-${col}`, `Column \`${col}\` exists in returned rows`);
    }
    assert(/^[0-9a-f-]{36}$/.test(sample.id), 'SCHEMA-uuid', '`id` is a valid UUID');
    assert(!isNaN(Date.parse(sample.created_at)), 'SCHEMA-ts-created', '`created_at` is a valid timestamp');
    assert(!isNaN(Date.parse(sample.due_date)), 'SCHEMA-ts-due', '`due_date` is a valid timestamp');
  }

  // ── TC-2.1 / TC-2.2: Category validation ────────────────────
  console.log('\n── TC-2.1 / TC-2.2: Categorization ───────────────────');
  const VALID_CATS = ['Academic', 'Skill Acquisition'];
  const invalidCats = tasks.filter(t => !VALID_CATS.includes(t.category));
  assert(invalidCats.length === 0, 'TC-2.x', 'All tasks have valid category values',
    invalidCats.length > 0 ? `Invalid: ${JSON.stringify(invalidCats.map(t => t.category))}` : '');

  const academicTasks = tasks.filter(t => t.category === 'Academic');
  const skillTasks    = tasks.filter(t => t.category === 'Skill Acquisition');
  assert(academicTasks.length > 0, 'TC-2.1', `"Academic" tasks exist (found ${academicTasks.length})`);
  assert(skillTasks.length > 0,    'TC-2.2', `"Skill Acquisition" tasks exist (found ${skillTasks.length})`);

  // ── TC-3.1 / TC-3.2: is_completed schema ────────────────────
  console.log('\n── TC-3.1 / TC-3.2: Status Tracking (Schema) ─────────');
  const allBoolean = tasks.every(t => typeof t.is_completed === 'boolean');
  assert(allBoolean, 'TC-3.x', 'All `is_completed` values are booleans');

  const completedTasks = tasks.filter(t => t.is_completed === true);
  const pendingTasks   = tasks.filter(t => t.is_completed === false);
  assert(completedTasks.length > 0, 'TC-3.1', `Completed tasks exist in seed data (found ${completedTasks.length})`);
  assert(pendingTasks.length > 0,   'TC-3.2', `Pending tasks exist in seed data (found ${pendingTasks.length})`);

  // ── Round-trip CRUD (Insert → Read → Update → Delete) ───────
  console.log('\n── Round-trip CRUD (Insert → Read → Update → Delete) ──');
  const testTask = {
    title: '__phase2_test_task__',
    description: 'Automated test — safe to delete',
    category: 'Skill Acquisition',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    is_completed: false,
  };

  let insertedId = null;
  try {
    const { data: inserted, error: insertErr } = await supabase
      .from('tasks')
      .insert(testTask)
      .select()
      .single();
    assert(!insertErr, 'TC-CRUD-1', 'INSERT succeeds', insertErr?.message);
    assert(!!inserted?.id, 'TC-CRUD-2', 'Inserted row has a UUID id');
    insertedId = inserted?.id;
  } catch (e) {
    assert(false, 'TC-CRUD-1', 'INSERT succeeds', e.message);
  }

  if (insertedId) {
    const { data: readBack, error: readErr } = await supabase
      .from('tasks').select('*').eq('id', insertedId).single();
    assert(!readErr && readBack?.title === testTask.title, 'TC-CRUD-3',
      'Inserted row can be read back by id');

    const { data: toggled, error: toggleErr } = await supabase
      .from('tasks').update({ is_completed: true }).eq('id', insertedId).select().single();
    assert(!toggleErr && toggled?.is_completed === true, 'TC-CRUD-4',
      'UPDATE `is_completed` → true succeeds');

    const { error: deleteErr } = await supabase
      .from('tasks').delete().eq('id', insertedId);
    assert(!deleteErr, 'TC-CRUD-5', 'DELETE succeeds');

    const { data: gone } = await supabase
      .from('tasks').select('id').eq('id', insertedId).maybeSingle();
    assert(gone === null, 'TC-CRUD-6', 'Deleted row no longer exists in DB');
  }

  // ── Summary ──────────────────────────────────────────────────
  const total = passCount + failCount;
  const status = failCount > 0 ? `(${failCount} FAILED)` : '🎉 All tests passed!';
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  Results: ${passCount}/${total} passed   ${status}`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
  process.exit(failCount > 0 ? 1 : 0);
}

run();
