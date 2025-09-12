import { http } from './http'
import type { DriverDeliveryItem, Driver } from '@/types/api'
import type { RequestOptions } from '@/api/http'

// Canonical driver endpoints per backend OpenAPI: /api/driver/*
const PREFIX = '/api/driver'

export async function listDeliveries(filter?: 'future' | 'past', opts?: RequestOptions): Promise<DriverDeliveryItem[]> {
  return http.get<DriverDeliveryItem[]>(`${PREFIX}/deliveries/`, { ...(opts || {}), query: filter ? { filter } : undefined })
}

export async function getProfile(opts?: RequestOptions): Promise<Driver> {
  return http.get<Driver>(`${PREFIX}/profile/`, opts)
}

// --- Extended driver endpoints (non-OpenAPI per api-map.txt) ---

// POST /drivers/api/location/
export async function updateLocation(payload: {
  latitude: number
  longitude: number
  accuracy_m?: number
  heading_deg?: number
  speed_kph?: number
}) {
  return http.post<{ status: string; recorded_at: string }>(`/drivers/api/location/`, payload)
}

// GET /drivers/api/suggestions/
export interface DriverDeliverySuggestion {
  delivery_id: number
  distance_km: number
  eta_minutes: number
  score: number
  pickup_latitude?: number
  pickup_longitude?: number
  pickup_location?: string | null
  pickup_date?: string | null
  pickup_time?: string | null
  delivery_location: string
  delivery_date?: string | null
  delivery_time?: string | null
}

export async function getSuggestions(params?: { limit?: number; radius_km?: number }, opts?: RequestOptions) {
  return http.get<DriverDeliverySuggestion[]>(`/drivers/api/suggestions/`, { ...(opts || {}), query: params as any })
}
