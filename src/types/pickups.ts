export type Priority = 'standard' | 'express' | 'urgent'

export interface NewPickupRequest {
  priority: Priority
  pickup: { name: string; address: string }
  dropoff: { name: string; address: string }
  etaMinutes: number
  distanceKm: number
  dimensions: string
  weightKg: number
  volumeL: number
  feeKr: number
  expiresInSeconds: number
}
