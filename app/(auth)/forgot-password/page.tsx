'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const [email,      setEmail]      = useState('');
  const [error,      setError]      = useState('');
  const [sent,       setSent]       = useState(false);
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    );

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div id="forgot-success" className="w-full max-w-sm animate-fade-in-up">
        <div
          className="rounded-2xl p-8 space-y-5 text-center"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div className="text-5xl">📧</div>
          <h1
            className="font-display tracking-wider uppercase text-2xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Check your email
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. Check your inbox.
          </p>
          <Link
            href="/login"
            id="back-to-login"
            className="inline-block text-sm font-semibold transition-colors duration-150"
            style={{ color: 'var(--accent)' }}
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="forgot-password-page" className="w-full max-w-sm animate-fade-in-up">

      {/* Card */}
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
            Reset password
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form id="forgot-password-form" onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Email
            </label>
            <input
              id="forgot-email"
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
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Inline error */}
          {error && (
            <p id="forgot-error" className="text-xs font-medium" style={{ color: '#ef4444' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="forgot-submit"
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
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: 'var(--foreground-muted)' }}>
          <Link
            id="back-to-login-link"
            href="/login"
            className="font-semibold transition-colors duration-150"
            style={{ color: 'var(--accent)' }}
          >
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
