# TaskFlow: Multi-User Authentication & Data Isolation Plan

This guide details the complete end-to-end architecture and implementation steps to turn **TaskFlow** from a single-user task tracker into a secure, multi-user application using **Supabase Auth**, **PostgreSQL Row Level Security (RLS)**, and **Next.js (App Router)**.

---

## 1. Architecture Overview

### Current State
- All records in the `tasks` table are shared globally.
- Any visitor to the site can view, update, and delete tasks.

### Target Multi-User State
- **Authentication:** Users register and sign in via email/password using Supabase Auth (`auth.users`).
- **Data Isolation:** Each task references the creator's user ID (`user_id UUID REFERENCES auth.users(id)`).
- **Row Level Security (RLS):** Database policies enforce that queries automatically filter by `auth.uid() = user_id`. Even with direct API access, users cannot access each other's data.
- **Route Protection:** Next.js middleware guards protected routes (`/`, `/calendar`, `/tasks`), redirecting unauthenticated visitors to `/login`.

```
[ Visitor / Friend ]
        │
        ▼
[ Next.js Middleware ] ──(Unauthenticated)──► [ /login or /signup ]
        │
        ▼ (Authenticated)
[ App Router (Dashboard / Tasks / Calendar) ]
        │
        ▼ (Supabase Client with Session JWT)
[ PostgreSQL Database ] ──(RLS: auth.uid() = user_id)──► User-Specific Records Only
```

---

## 2. Phase 1: Database Migration & RLS (Supabase Dashboard)

Run the following SQL in your **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Add user_id column referencing auth.users
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Automatically default user_id to the authenticated user's ID
ALTER TABLE tasks 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. Enable Row Level Security (RLS) on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- SELECT: Users can only view tasks they created
CREATE POLICY "Users can view their own tasks" 
ON tasks FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT: Users can only create tasks for themselves
CREATE POLICY "Users can insert their own tasks" 
ON tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own tasks
CREATE POLICY "Users can update their own tasks" 
ON tasks FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own tasks
CREATE POLICY "Users can delete their own tasks" 
ON tasks FOR DELETE 
USING (auth.uid() = user_id);
```

> **Note on Existing Tasks:** If you want to keep your existing tasks associated with your account, create your account first, find your UUID in **Authentication → Users**, and run:
> ```sql
> UPDATE tasks SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
> ```

---

## 3. Phase 2: Next.js Supabase SSR & Middleware Setup

Install the official Supabase SSR package:

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### 3.1 Browser Client (`utils/supabase/client.ts`)
For use inside Client Components (`'use client'`):

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 3.2 Server Client (`utils/supabase/server.ts`)
For use in Server Components, Server Actions, and Route Handlers:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handled via middleware cookie synchronization
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handled via middleware cookie synchronization
          }
        },
      },
    }
  );
}
```

### 3.3 Root Session Middleware (`middleware.ts`)
Create `middleware.ts` in the project root to refresh auth tokens and guard routes:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  // If not logged in and attempting to visit protected pages
  if (!user && !isAuthPath && !request.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // If already logged in and visiting login/signup, redirect to dashboard
  if (user && isAuthPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## 4. Phase 3: Auth Pages & User Navigation

### 4.1 Login Page (`app/login/page.tsx`)
- Card-based form matching TaskFlow's clean theme.
- Input fields: Email and Password.
- Handlers calling `supabase.auth.signInWithPassword({ email, password })`.
- Link to sign up page.

### 4.2 Signup Page (`app/signup/page.tsx`)
- Input fields: Name, Email, Password, Confirm Password.
- Handlers calling `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`.
- Clear user feedback if email verification is required.

### 4.3 Navigation Header Update (`components/Navbar.tsx`)
- Display current user profile / email initial avatar.
- Provide a **Logout / Sign Out** button:
  ```typescript
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };
  ```

---

## 5. Phase 4: Supabase Settings Configuration

In your **Supabase Dashboard**:
1. Go to **Authentication → Providers → Email**.
2. **For Instant Testing:** Uncheck **"Confirm email"** so you and your friends can register and sign in right away without checking an inbox for confirmation links.
3. Under **Authentication → URL Configuration**, ensure **Site URL** is set to your production domain (`https://to-do-list-tracker-xi.vercel.app/`) or `http://localhost:3000` for development.

---

## 6. Phase 5: Testing & Quality Assurance Checklist

- [ ] **Account Creation:** Register an account for User 1 (`user1@test.com`). Verify redirection to Dashboard.
- [ ] **Task Creation:** Create 3 tasks under User 1. Verify tasks show on Dashboard, Tasks page, and Calendar.
- [ ] **Logout Flow:** Click Sign Out. Ensure redirected back to `/login`.
- [ ] **Route Guard:** Try navigating to `/calendar` directly in URL bar without logging in. Verify redirection to `/login`.
- [ ] **Data Isolation (User 2):** Register User 2 (`user2@test.com`).
  - Verify User 2 starts with an empty dashboard (0 tasks, empty calendar).
  - Add 2 tasks as User 2.
- [ ] **Cross-Account Verification:** Log back in as User 1. Verify User 1 sees strictly their 3 tasks and none of User 2's tasks.

---

## 7. Antigravity Prompt (For Automated Implementation)

Copy and paste the prompt below into Antigravity to apply these changes across your codebase:

```markdown
Transform TaskFlow into a multi-user application using Supabase Auth and Next.js App Router.

Requirements:
1. Setup @supabase/ssr utilities:
   - Create `utils/supabase/client.ts` using createBrowserClient.
   - Create `utils/supabase/server.ts` using createServerClient with next/headers cookies.
   - Add root `middleware.ts` to refresh session cookies and protect all routes (`/`, `/calendar`, `/tasks`) by redirecting unauthenticated users to `/login`.
2. Auth Pages:
   - Create `/login` and `/signup` pages with clean responsive form cards matching TaskFlow's UI style.
   - Implement Supabase email/password sign-in and sign-up with client validation and error messages.
3. Navigation:
   - In the top header/navbar, show the authenticated user's email/avatar and a "Sign Out" button that clears the session and redirects to `/login`.
4. Database Integration:
   - Ensure all task queries and insertions work seamlessly with Supabase Row Level Security (RLS) linked to `auth.uid()`.
```