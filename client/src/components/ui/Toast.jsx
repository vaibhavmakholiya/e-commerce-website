import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../utils/helpers';

/* Notification icons */
const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const BADGE_VARIANT = {
  success: 'badge-success',
  error: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
};

/* Context */
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

/**
 * ToastProvider — Wrap the app root to enable toasts anywhere.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success('Item added to cart!');
 *   toast.error('Could not connect to server.');
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, opts) => addToast({ message: msg, type: 'success', ...opts }),
    error:   (msg, opts) => addToast({ message: msg, type: 'error',   ...opts }),
    warning: (msg, opts) => addToast({ message: msg, type: 'warning', ...opts }),
    info:    (msg, opts) => addToast({ message: msg, type: 'info',    ...opts }),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="toast-container"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className={cn('toast-item')}>
            <span
              className={cn('badge badge-pill', BADGE_VARIANT[t.type])}
              style={{ fontSize: '0.9rem', minWidth: '28px', justifyContent: 'center' }}
              aria-hidden="true"
            >
              {ICONS[t.type]}
            </span>
            <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.15rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
