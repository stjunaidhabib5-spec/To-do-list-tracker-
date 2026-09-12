'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [loading,         setLoading]         = useState(false);
  const [successMsg,      setSuccessMsg]      = useState('');

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!email.trim())       next.email = 'Email is required.';
    if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/login?confirmed=1`,
      },
    });

    if (authError) {
      setErrors({ form: authError.message });
      setLoading(false);
      return;
    }

    // Email confirmation is ON — show a success message instead of redirecting
    setSuccessMsg(
      `Almost there! We've sent a confirmation link to ${email.trim()}. Please check your inbox and click the link to activate your account.`,
    );
    setLoading(false);
  }

  if (successMsg) {
    return (
      <div id="signup-success" className="w-full max-w-sm animate-fade-in-up">
        <div
          className="rounded-2xl p-8 space-y-5 text-center"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div className="text-5xl">📬</div>
          <h1
            className="font-display tracking-wider uppercase text-2xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Check your email
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            {successMsg}
          </p>
          <Link
            href="/login"
            id="go-to-login"
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
    <div id="signup-page" className="w-full max-w-sm animate-fade-in-up">

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
            Create account
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Join TaskFlow and start tracking your goals
          </p>
        </div>

        {/* Form */}
        <form id="signup-form" onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="signup-email"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150"
              style={{
                background: 'var(--surface-subtle)',
                border: `1px solid ${errors.email ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--foreground)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = errors.email ? '#ef4444' : 'var(--accent)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = errors.email ? '#ef4444' : 'var(--border)'; }}
            />
            {errors.email && (
              <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="signup-password"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150"
              style={{
                background: 'var(--surface-subtle)',
                border: `1px solid ${errors.password ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--foreground)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : 'var(--accent)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : 'var(--border)'; }}
            />
            {errors.password && (
              <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="signup-confirm-password"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150"
              style={{
                background: 'var(--surface-subtle)',
                border: `1px solid ${errors.confirmPassword ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--foreground)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = errors.confirmPassword ? '#ef4444' : 'var(--accent)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = errors.confirmPassword ? '#ef4444' : 'var(--border)'; }}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Server-level form error */}
          {errors.form && (
            <p id="signup-error" className="text-xs font-medium" style={{ color: '#ef4444' }}>
              {errors.form}
            </p>
          )}

          {/* Submit */}
          <button
            id="signup-submit"
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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: 'var(--foreground-muted)' }}>
          Already have an account?{' '}
          <Link
            id="login-link"
            href="/login"
            className="font-semibold transition-colors duration-150"
            style={{ color: 'var(--accent)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
