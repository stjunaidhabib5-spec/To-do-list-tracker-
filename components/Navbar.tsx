'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/',          label: 'Dashboard', id: 'nav-dashboard' },
  { href: '/calendar',  label: 'Calendar',  id: 'nav-calendar'  },
  { href: '/tasks',     label: 'Tasks',     id: 'nav-tasks'     },
];

export default function Navbar() {
  const pathname = usePathname();

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
            className="text-lg font-semibold tracking-tight"
            style={{ color: 'var(--foreground)' }}
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
      </nav>
    </header>
  );
}
