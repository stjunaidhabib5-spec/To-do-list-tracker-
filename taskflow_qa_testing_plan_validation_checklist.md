# TaskFlow: End-to-End QA Testing Plan & Validation Checklist

This document provides a complete manual and automated test protocol for **TaskFlow**. Use this checklist to verify that multi-user authentication, Row Level Security (RLS), task management, and calendar synchronization operate reliably without regressions.

---

## 1. Test Environment Setup & Pre-Flight Checks

Before running functional tests, ensure your local or staging environment is properly connected.

- [ ] **Supabase Status:** Check Supabase Dashboard to confirm your database instance is active (green indicator).
- [ ] **Environment Variables:** Verify `.env.local` (or Vercel Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **Test Accounts:** Prepare credentials for two distinct test users:
  - **User Alpha:** `user_alpha@test.com` (Password: `TestPass123!`)
  - **User Beta:** `user_beta@test.com` (Password: `TestPass123!`)

---

## 2. Test Suite 1: Authentication & Route Protection

| ID | Test Scenario | Step-by-Step Actions | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Route Guard (Unauthenticated Access) | 1. Open an incognito/private browser tab.<br>2. Manually navigate directly to `https://<domain>/calendar` or `https://<domain>/tasks`. | The user is immediately intercepted by `middleware.ts` and redirected to `/login`. No private data or layout flashes on screen. | [x] (via Auto) |
| **AUTH-02** | New User Registration (Sign Up) | 1. Navigate to `/signup`.<br>2. Fill in full name, email (`user_alpha@test.com`), and valid password.<br>3. Submit the form. | Form validates without error. Account is registered in Supabase `auth.users`. User is redirected either to `/login` with a confirmation toast or logged straight into Dashboard (`/`). | [x] (via Auto) |
| **AUTH-03** | User Authentication (Sign In) | 1. Go to `/login`.<br>2. Submit valid credentials for User Alpha.<br>3. Submit with incorrect password. | **Valid:** Redirects to dashboard with active session cookies.<br>**Invalid:** Displays a descriptive red error banner without crashing. | [x] (via Auto) |
| **AUTH-04** | Session Persistence | 1. Log in as User Alpha.<br>2. Refresh the browser tab or close and reopen the browser window.<br>3. Navigate across `/`, `/calendar`, `/tasks`. | Session stays alive; auth token is refreshed in cookies via middleware; user is not prompted to log in again. | [x] (via Auto) |
| **AUTH-05** | Logout (Sign Out) | 1. While logged in, click the **Sign Out** button in the header/navbar.<br>2. Attempt to click browser "Back" button. | Auth cookies are purged, user is redirected to `/login`, and pressing "Back" cannot access protected routes. | [x] (via Auto) |

---

## 3. Test Suite 2: Multi-User Data Isolation & Row-Level Security (RLS)

| ID | Test Scenario | Step-by-Step Actions | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| **RLS-01** | Clean Slate for Fresh Users | 1. Log in as **User Beta** (first time).<br>2. Inspect Dashboard statistics, Task list, and Calendar. | All counts show 0 (0 Total Tasks, 0 Pending, 0 Completed). Calendar contains zero sticky notes. User Alpha's existing tasks are completely hidden. | [x] (via Auto) |
| **RLS-02** | Independent Task Creation | 1. While logged in as **User Beta**, create 2 new tasks:<br>   - Task 1: "Beta's Secret Task"<br>   - Task 2: "Beta's Grocery List"<br>2. Verify they appear on Beta's dashboard. | Tasks save with Beta's `user_id`. Stats show 2 Total Tasks, 2 Pending. | [x] (via Auto) |
| **RLS-03** | Cross-Account Leak Prevention | 1. Log out of User Beta.<br>2. Log in as **User Alpha**.<br>3. Search and review Dashboard, Tasks, and Calendar. | User Alpha sees strictly their own tasks. "Beta's Secret Task" and "Beta's Grocery List" are never visible or accessible. | [x] (via Auto) |
| **RLS-04** | Database API Exploitation Prevention | 1. Open Browser DevTools (`F12` → Console).<br>2. Attempt to query all tasks using the browser client:<br>`await supabase.from('tasks').select('*')` | Query only returns records where `user_id === current_logged_in_user`. Postgres RLS stops cross-tenant data leaks even on direct select. | [x] (via Auto) |

---

## 4. Test Suite 3: Task CRUD Operations

| ID | Test Scenario | Step-by-Step Actions | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| **CRUD-01** | Task Creation with Category & Date | 1. Click **+ Add Task** button.<br>2. Enter Title, Description, Select Category (e.g., *Academic*), Due Date & Time.<br>3. Click Submit. | Modal closes smoothly. Task appears instantly in the task list and increments the dashboard "Total Tasks" counter. | [x] (via Auto) |
| **CRUD-02** | Status Toggle (Pending ⇄ Completed) | 1. In `/tasks` or Dashboard, click the circular checkbox next to a pending task.<br>2. Observe visual state changes.<br>3. Refresh the page. | Task gains strikethrough/checked style. "Completed" counter increments by 1; "Pending" counter decrements by 1. State persists across refresh. | [x] (via Auto) |
| **CRUD-03** | Task Editing | 1. Click the edit icon or open task details.<br>2. Change task title, category, or due date.<br>3. Save changes. | Task updates immediately on UI and in database without creating duplicate entries. | [ ] |
| **CRUD-04** | Task Deletion | 1. Click Delete (trash icon) on a task.<br>2. Confirm deletion prompt (if any). | Task is immediately removed from list and database. Counters update accordingly. | [x] (via Auto) |
| **CRUD-05** | Overdue Detection | 1. Create a task with a due date set to yesterday.<br>2. Verify styling. | An "Overdue" warning label/badge in red is displayed alongside the due date timestamp. | [x] (via Auto) |

---

## 5. Test Suite 4: Calendar Synchronization & Overflow UI

| ID | Test Scenario | Step-by-Step Actions | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| **CAL-01** | Accurate Date Mapping & Timezones | 1. Create a task due on September 22, 2026 at 12:13 PM.<br>2. Navigate to `/calendar` and check the cell for September 22. | The task appears squarely inside the cell for **Sept 22** (not Sept 21 or Sept 23 due to UTC conversion bugs). | [x] (via Auto) |
| **CAL-02** | Real-Time / Instant Synchronization | 1. Open `/calendar`.<br>2. Click **+ Add Task** and set the due date to the 15th of the currently displayed month.<br>3. Submit the modal. | The new task appears on day 15 immediately without requiring a manual browser refresh (`Cmd+R` / `F5`). | [x] (via Auto) |
| **CAL-03** | 3-Task Visible Limit | 1. Add 3 distinct tasks to a single date (e.g., Sept 10).<br>2. Check the calendar day sticky note card. | All 3 tasks are cleanly listed as bullet items inside the card. | [ ] |
| **CAL-04** | Overflow Display (`+N more`) | 1. Add a 4th and 5th task to that same date (total 5 tasks).<br>2. Check the calendar cell. | The cell displays the first 3 tasks, followed by a clean, borderless `+2 more` text label (no ugly grey box or pill). | [ ] |
| **CAL-05** | Overflow Interaction / Detail Popover | 1. Click the `+2 more` text or click the calendar day cell. | A modal or popover opens presenting all 5 tasks for that day with their category badges and completion statuses. | [ ] |
| **CAL-06** | Month Navigation | 1. Click Previous (`<`) and Next (`>`) arrows on the calendar header.<br>2. Switch between months. | Calendar updates month/year grid smoothly. Tasks for adjacent months load into their respective dates without errors. | [ ] |

---

## 6. Test Suite 5: Resilience & Edge Cases

| ID | Test Scenario | Step-by-Step Actions | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| **EDGE-01** | Database Inactivity / Resumption | 1. Simulate API failure (or review behavior during Supabase pause).<br>2. Submit a task. | The app handles errors gracefully with a notification/toast rather than displaying a blank white screen or crashing. | [ ] |
| **EDGE-02** | Empty Input Submissions | 1. Open the **+ Add Task** modal.<br>2. Leave the title blank and click Submit. | Form blocks submission with inline validation ("Title is required"). | [x] (via Auto) |
| **EDGE-03** | Long Text Truncation | 1. Create a task with an exceptionally long title (e.g., 100+ characters).<br>2. View the task card on the calendar. | Text is cleanly truncated with ellipsis (`truncate` / `line-clamp-1`) without stretching or breaking the calendar grid layout. | [ ] |
| **EDGE-04** | Responsive Mobile View | 1. Open Chrome DevTools (`F12` → Device Toolbar → iPhone 14/SE).<br>2. Inspect navigation, task list, and calendar. | Navigation collapses or adapts cleanly. Calendar allows horizontal scrolling or adapts to a mobile-friendly view without clipped controls. | [ ] |

---

## 7. Sign-Off & Release Gate

- [x] All Critical (P0) tests in **Suite 1 (Auth)** and **Suite 2 (RLS)** passed.
- [x] All Major (P1) tests in **Suite 3 (CRUD)** and **Suite 4 (Calendar)** passed (Automated portion).
- [x] No cross-account data leaks detected.
- [ ] Verified on production URL (`https://to-do-list-tracker-xi.vercel.app/`).

**Tester Name:** _______________________  
**Date Tested:** _______________________  
**Overall Result:** [ ] PASS  [ ] FAIL