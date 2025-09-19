import { http } from './http'
import type { DriverDeliveryItem, Driver } from '@/types/api'
import type { RequestOptions } from '@/api/http'

// Allow environment overrides for driver endpoints
const ENV_DRIVER_PREFIX = ((import.meta as any).env?.VITE_DRIVER_PREFIX as string | undefined)?.replace(/\/$/, '')
const ENV_DRIVER_ALT_PREFIX = ((import.meta as any).env?.VITE_DRIVER_ALT_PREFIX as string | undefined)?.replace(/\/$/, '')
const ENV_DRIVER_PROFILE_PATH = (import.meta as any).env?.VITE_DRIVER_PROFILE_PATH as string | undefined
const ENV_DRIVER_DELIVERIES_PATH = (import.meta as any).env?.VITE_DRIVER_DELIVERIES_PATH as string | undefined

const PREFIX = ENV_DRIVER_PREFIX || '/api/driver'
const ALT_PREFIX = ENV_DRIVER_ALT_PREFIX || '/dashboard/api/driver'

function normalize(p: string): string {
  let s = p.trim()
  if (!s.startsWith('/')) s = '/' + s
  // Ensure trailing slash for consistency
  if (!s.endsWith('/')) s = s + '/'
  return s
}

function candidatePaths(kind: 'profile' | 'deliveries'): string[] {
  const envPath = kind === 'profile' ? ENV_DRIVER_PROFILE_PATH : ENV_DRIVER_DELIVERIES_PATH
  const defaults = kind === 'profile'
    ? [normalize(`${PREFIX}/profile`), normalize(`${ALT_PREFIX}/profile`), '/api/profile/']
    : [normalize(`${PREFIX}/deliveries`), normalize(`${ALT_PREFIX}/deliveries`), '/api/driver-deliveries/']
  const list = [envPath ? normalize(envPath) : undefined, ...defaults].filter(Boolean) as string[]
  // Deduplicate
  return Array.from(new Set(list))
}

async function getFirstOk<T>(paths: string[], opts?: RequestOptions & { query?: any }): Promise<T> {
  let lastErr: any
  for (const p of paths) {
    try {
      return await http.get<T>(p, opts as any)
    } catch (e: any) {
      lastErr = e
      if (e?.status !== 404) throw e
    }
  }
  throw lastErr
}

export async function listDeliveries(filter?: 'future' | 'past', opts?: RequestOptions): Promise<DriverDeliveryItem[]> {
  const paths = candidatePaths('deliveries')
  return getFirstOk<DriverDeliveryItem[]>(paths, { ...(opts || {}), query: filter ? { filter } : undefined })
}

export async function getProfile(opts?: RequestOptions): Promise<Driver> {
  const paths = candidatePaths('profile')
  return getFirstOk<Driver>(paths, opts)
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
