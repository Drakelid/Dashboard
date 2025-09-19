import { http } from './http'
import type { DriverDeliveryItem, Driver } from '@/types/api'
import type { RequestOptions } from '@/api/http'

// Canonical driver endpoints per backend OpenAPI: /api/driver/*
const PREFIX = '/api/driver'
const ALT_PREFIX = '/dashboard/api/driver'

export async function listDeliveries(filter?: 'future' | 'past', opts?: RequestOptions): Promise<DriverDeliveryItem[]> {
  try {
    return await http.get<DriverDeliveryItem[]>(`${PREFIX}/deliveries/`, { ...(opts || {}), query: filter ? { filter } : undefined })
  } catch (e: any) {
    if (e?.status === 404) {
      return await http.get<DriverDeliveryItem[]>(`${ALT_PREFIX}/deliveries/`, { ...(opts || {}), query: filter ? { filter } : undefined })
    }
    throw e
  }
}

export async function getProfile(opts?: RequestOptions): Promise<Driver> {
  try {
    return await http.get<Driver>(`${PREFIX}/profile/`, opts)
  } catch (e: any) {
    if (e?.status === 404) {
      return await http.get<Driver>(`${ALT_PREFIX}/profile/`, opts)
    }
    throw e
  }
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
  const path = ((import.meta as any).env?.VITE_DRIVER_LOCATION_PATH as string) || '/drivers/api/location/'
  return http.post<{ status: string; recorded_at: string }>(path, payload)
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
