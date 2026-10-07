import { reactive } from 'vue'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  /** Reuse an id to replace a toast that is already showing. */
  id?: string | number
  description?: string
  variant?: ToastVariant
  /** Milliseconds before it dismisses itself. Use Infinity to keep it until dismissed. */
  duration?: number
  action?: { label: string; onClick: () => void }
}

export interface ToastItem extends ToastOptions {
  id: string | number
  title: string
  variant: ToastVariant
  duration: number
}

/** The toasts currently on screen. <Toaster /> renders this list. */
export const toasts = reactive<ToastItem[]>([])

let count = 0

function show(title: string, options: ToastOptions = {}): string | number {
  const id = options.id ?? ++count
  // Toasts are a browser-only concern; on the server this is a no-op.
  if (typeof window === 'undefined') return id

  const item: ToastItem = { variant: 'default', duration: 4000, ...options, id, title }
  const existing = toasts.findIndex((toast) => toast.id === id)
  if (existing > -1) toasts.splice(existing, 1, item)
  else toasts.push(item)
  return id
}

/** Dismiss one toast by id, or all of them when called without one. */
export function dismissToast(id?: string | number) {
  if (id === undefined) {
    toasts.splice(0)
    return
  }
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index > -1) toasts.splice(index, 1)
}

const withVariant = (variant: ToastVariant) => (title: string, options?: ToastOptions) =>
  show(title, { ...options, variant })

/**
 * Show a toast from anywhere: `toast('Saved')`, `toast.error('Upload failed', { description })`.
 * Needs one `<Toaster />` mounted somewhere in the app.
 */
export const toast = Object.assign(show, {
  success: withVariant('success'),
  error: withVariant('error'),
  warning: withVariant('warning'),
  info: withVariant('info'),
  dismiss: dismissToast,
})
