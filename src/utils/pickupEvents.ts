import type { NewPickupRequest } from '@/types/pickups'

export const NEW_PICKUP_EVENT = 'new-pickup-request' as const

export function emitNewPickupRequest(request: NewPickupRequest) {
  window.dispatchEvent(new CustomEvent<NewPickupRequest>(NEW_PICKUP_EVENT, { detail: request }))
}

export type NewPickupListener = (request: NewPickupRequest) => void

export function addNewPickupListener(listener: NewPickupListener) {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<NewPickupRequest>
    listener(ce.detail)
  }
  window.addEventListener(NEW_PICKUP_EVENT, handler as EventListener)
  return () => window.removeEventListener(NEW_PICKUP_EVENT, handler as EventListener)
}
