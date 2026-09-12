'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { href: '/',          label: 'Dashboard', id: 'nav-dashboard' },
  { href: '/calendar',  label: 'Calendar',  id: 'nav-calendar'  },
  { href: '/tasks',     label: 'Tasks',     id: 'nav-tasks'     },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // ── Fetch the current session user client-side ───────────────────────────
  useEffect(() => {
    const supabase = createClient();

    // Get the current user on mount
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Subscribe to auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign out handler ──────────────────────────────────────────────────────
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // ── Avatar: first letter of email, uppercased ─────────────────────────────
  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header
      id="main-navbar"
      style={{
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
      }}
      className="sticky top-0 z-50 backdrop-blur-xl"
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── Logo / Brand ── */}
        <Link
          id="nav-logo"
          href="/"
          className="flex items-center gap-2.5 group"
        >
          {/* Icon mark */}
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold shadow-lg"
            style={{ background: 'var(--accent)' }}
          >
            T
          </span>
          <span
            className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            Task<span style={{ color: 'var(--accent)' }}>Flow</span>
          </span>
        </Link>

        {/* ── Nav Links ── */}
        <ul className="flex items-center gap-1" role="list">
          {navLinks.map(({ href, label, id }) => {
            const isActive = href === '/'
              ? pathname === '/'
              : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  id={id}
                  href={href}
                  className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--foreground-muted)',
                    background: isActive ? 'var(--accent-subtle)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)';
                      (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-subtle)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground-muted)';
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    }
                  }}
                >
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: 'var(--accent)' }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Right Section: Theme Toggle + User Avatar + Sign Out ── */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user && (
            <>
              {/* Avatar circle — shows first letter of email */}
              <div
                id="nav-user-avatar"
                title={user.email ?? ''}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white select-none"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                }}
                aria-label={`Signed in as ${user.email}`}
              >
                {avatarLetter}
              </div>

              {/* Sign Out button */}
              <button
                id="nav-sign-out"
                onClick={handleSignOut}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                style={{
                  color: 'var(--foreground-muted)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-subtle)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground-muted)';
                }}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
