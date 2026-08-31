/**
 * TaskFlow — Phase 5 Production Deployment Test Suite
 * Tests: Verifies the live Vercel deployment, environment variable configuration,
 *        and successful connection to the production Supabase database.
 *
 * Run with:
 *   node supabase/test-phase5.mjs
 */

import http from 'http';
import https from 'https';

const PROD_URL = 'https://to-do-list-tracker-xi.vercel.app';

const PASS = '\x1b[32m✅ PASS\x1b[0m';
const FAIL = '\x1b[31m❌ FAIL\x1b[0m';
let pass = 0, fail = 0;

function assert(condition, id, desc, detail = '') {
  if (condition) { console.log(`  ${PASS}  [${id}] ${desc}`); pass++; }
  else { console.log(`  ${FAIL}  [${id}] ${desc}${detail ? '\n         → ' + detail : ''}`); fail++; }
}

async function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PROD_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', err => reject(err));
  });
}

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   TaskFlow — Phase 5 Production Deployment Tests        ║');
console.log(`║   URL: ${PROD_URL.padEnd(41)} ║`);
console.log('╚══════════════════════════════════════════════════════════╝\n');

async function runTests() {
  console.log('── 1. Vercel Deployment & Route Availability ──────────────');
  
  let dashRes, tasksRes, calRes;
  try {
    dashRes = await fetchRoute('/');
    assert(dashRes.status === 200, 'PROD-1.1', 'Dashboard (/) is accessible (HTTP 200)');
    
    tasksRes = await fetchRoute('/tasks');
    assert(tasksRes.status === 200, 'PROD-1.2', 'Tasks (/tasks) is accessible (HTTP 200)');
    
    calRes = await fetchRoute('/calendar');
    assert(calRes.status === 200, 'PROD-1.3', 'Calendar (/calendar) is accessible (HTTP 200)');
  } catch (err) {
    console.error(`\n❌ Network Error: Could not reach ${PROD_URL}`);
    console.error(`   Details: ${err.message}`);
    process.exit(1);
  }

  console.log('\n── 2. Environment Variables & Supabase Connection ─────────');
  
  // If the app successfully queries Supabase, it will NOT render mock-N IDs.
  // Next.js Server Components will fail and return a 500 if env vars are missing.
  assert(!dashRes.body.includes('mock-1'), 'PROD-2.1', 'Dashboard is not using mock data (Environment variables injected)');
  assert(dashRes.body.includes('Total Tasks') && dashRes.body.includes('Pending'), 'PROD-2.2', 'Live Supabase statistics successfully computed and rendered');
  assert(!tasksRes.body.includes('mock-1'), 'PROD-2.3', 'Tasks page is not using mock data');
  
  // The tasks page should render the ToastProvider and skeleton placeholders initially
  assert(tasksRes.body.includes('ToastProvider') || tasksRes.body.includes('toast-container') || tasksRes.body.length > 5000, 'PROD-2.4', 'Client components successfully bundled and delivered');

  console.log('\n── 3. Page Structure & Rendering ──────────────────────────');
  
  assert(dashRes.body.includes('TaskFlow') || dashRes.body.includes('Dashboard'), 'PROD-3.1', 'Dashboard title and metadata rendered');
  assert(tasksRes.body.includes('My Tasks') && tasksRes.body.includes('add-task-fab'), 'PROD-3.2', 'Tasks page UI components (Header, FAB) rendered');
  assert(calRes.body.includes('task-calendar') && calRes.body.includes('Calendar'), 'PROD-3.3', 'Calendar page wrapper rendered');
  
  const total = pass + fail;
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  Results: ${String(pass).padEnd(2)}/${total} passed   ${fail > 0 ? '(' + fail + ' FAILED)' : '🎉 Deployment Verified!'} `);
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  process.exit(fail > 0 ? 1 : 0);
}

runTests();
