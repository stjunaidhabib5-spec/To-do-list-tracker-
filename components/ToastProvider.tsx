'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Individual Toast ──────────────────────────────────────────────────────────
function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const isSuccess = item.type === 'success';

  return (
    <div
      id={`toast-${item.id}`}
      role="alert"
      aria-live="assertive"
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up"
      style={{
        background: isSuccess ? 'var(--surface)' : 'var(--surface)',
        border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
        color: 'var(--foreground)',
        boxShadow: 'var(--glass-shadow)',
        minWidth: '260px',
        maxWidth: '360px',
      }}
    >
      {/* Icon */}
      <span className="text-base flex-shrink-0" aria-hidden="true">
        {isSuccess ? '✅' : '❌'}
      </span>

      {/* Message */}
      <span className="flex-1">{item.message}</span>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded opacity-50 hover:opacity-100 transition-opacity cursor-pointer text-xs"
        style={{ color: 'var(--foreground-muted)' }}
      >
        ✕
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — fixed top-center */}
      {toasts.length > 0 && (
        <div
          id="toast-container"
          className="fixed top-5 left-1/2 z-[100] flex flex-col gap-2 items-center"
          style={{ transform: 'translateX(-50%)' }}
          aria-label="Notifications"
        >
          {toasts.map(item => (
            <Toast key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
