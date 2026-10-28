import React, { useCallback, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { ToastContext, type ToastContextValue } from '../contexts/ToastContext'
import type { ToastItem, ToastType } from '../types/toast'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, options?: { type?: ToastType; title?: string; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const duration = options?.duration ?? 4000
      const newToast: ToastItem = {
        id,
        message,
        type: options?.type ?? 'info',
        title: options?.title,
        duration,
      }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast],
  )

  const success = useCallback(
    (message: string, title?: string) => showToast(message, { type: 'success', title }),
    [showToast],
  )
  const error = useCallback(
    (message: string, title?: string) => showToast(message, { type: 'error', title }),
    [showToast],
  )
  const info = useCallback(
    (message: string, title?: string) => showToast(message, { type: 'info', title }),
    [showToast],
  )
  const warning = useCallback(
    (message: string, title?: string) => showToast(message, { type: 'warning', title }),
    [showToast],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      showToast,
      removeToast,
      success,
      error,
      info,
      warning,
    }),
    [toasts, showToast, removeToast, success, error, info, warning],
  )

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
    info: <Info className="h-4 w-4 text-indigo-400 shrink-0" />,
  }

  const borderTone: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-zinc-950/95 text-emerald-200',
    error: 'border-red-500/30 bg-zinc-950/95 text-red-200',
    warning: 'border-amber-500/30 bg-zinc-950/95 text-amber-200',
    info: 'border-indigo-500/30 bg-zinc-950/95 text-indigo-200',
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={[
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md transition-all',
              borderTone[toast.type],
            ].join(' ')}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="text-xs font-semibold text-zinc-100">{toast.title}</div>
              )}
              <div className="text-xs text-zinc-300 leading-relaxed break-words">{toast.message}</div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
              aria-label="Dismiss toast"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
