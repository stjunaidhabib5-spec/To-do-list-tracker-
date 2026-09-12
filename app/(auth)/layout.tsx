/**
 * Auth group layout — wraps /login, /signup, and /forgot-password.
 * Intentionally has NO Navbar and NO AddTaskFAB; just a clean centered canvas.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="auth-layout"
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--background)' }}
    >
      {children}
    </div>
  );
}
