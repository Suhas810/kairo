import { createContext } from 'react'
import type { ToastItem, ToastType } from '../types/toast'

export interface ToastContextValue {
  toasts: ToastItem[]
  showToast: (message: string, options?: { type?: ToastType; title?: string; duration?: number }) => void
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
