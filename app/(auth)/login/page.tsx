'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// ── Inner component that reads searchParams (needs Suspense) ──────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [callbackMsg, setCallbackMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('error') === 'auth_callback_failed') {
      setError('The confirmation link has expired or is invalid. Please sign in or request a new link.');
    }
    if (searchParams.get('confirmed') === '1') {
      setCallbackMsg('Email confirmed! You can now sign in.');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div
      className="rounded-2xl p-8 space-y-6"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      {/* Header */}
      <div className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <span
            className="flex items-center justify-center w-12 h-12 rounded-xl text-white text-xl font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)' }}
          >
            T
          </span>
        </div>
        <h1
          className="font-display tracking-wider uppercase text-2xl font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Sign in to your TaskFlow account
        </p>
      </div>

      {/* Success message from email confirmation */}
      {callbackMsg && (
        <div
          className="text-sm rounded-xl px-4 py-3 font-medium"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          {callbackMsg}
        </div>
      )}

      {/* Form */}
      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150"
            style={{
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
            onFocus={e  => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={e   => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Password
            </label>
            <Link
              id="forgot-password-link"
              href="/forgot-password"
              className="text-xs transition-colors duration-150"
              style={{ color: 'var(--accent)' }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150"
            style={{
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>

        {/* Inline error */}
        {error && (
          <p id="login-error" className="text-xs font-medium" style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs" style={{ color: 'var(--foreground-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link
          id="signup-link"
          href="/signup"
          className="font-semibold transition-colors duration-150"
          style={{ color: 'var(--accent)' }}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

// ── Page export (wraps LoginForm in Suspense for useSearchParams) ─────────────
export default function LoginPage() {
  return (
    <div id="login-page" className="w-full max-w-sm animate-fade-in-up">
      <Suspense fallback={
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-12 rounded-xl mx-auto" style={{ background: 'var(--surface-subtle)' }} />
            <div className="h-4 rounded" style={{ background: 'var(--surface-subtle)' }} />
            <div className="h-10 rounded-xl" style={{ background: 'var(--surface-subtle)' }} />
            <div className="h-10 rounded-xl" style={{ background: 'var(--surface-subtle)' }} />
            <div className="h-10 rounded-xl" style={{ background: 'var(--accent)', opacity: 0.3 }} />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
