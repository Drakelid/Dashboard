export type ToastType = 'success' | 'error' | 'info'
export type ToastPayload = {
  id?: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

const EVENT = 'APP_TOAST'

function uid() {
  return Math.random().toString(36).slice(2)
}

export const toast = {
  show(payload: ToastPayload) {
    const detail: Required<ToastPayload> = {
      id: payload.id || uid(),
      type: payload.type,
      title: payload.title || '',
      message: payload.message,
      duration: payload.duration ?? 3000,
    }
    window.dispatchEvent(new CustomEvent<Required<ToastPayload>>(EVENT, { detail }))
    return detail.id
  },
  success(message: string, title?: string, duration?: number) {
    return toast.show({ type: 'success', message, title, duration })
  },
  error(message: string, title?: string, duration?: number) {
    return toast.show({ type: 'error', message, title, duration })
  },
  info(message: string, title?: string, duration?: number) {
    return toast.show({ type: 'info', message, title, duration })
  },
  EVENT,
}

export type ToastListener = (payload: Required<ToastPayload>) => void
export function addToastListener(listener: ToastListener) {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<Required<ToastPayload>>
    listener(ce.detail)
  }
  window.addEventListener(EVENT, handler as EventListener)
  return () => window.removeEventListener(EVENT, handler as EventListener)
}
