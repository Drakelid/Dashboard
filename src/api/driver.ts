import { http } from './http'
import type { DriverDeliveryItem, Driver, Vehicle } from '@/types/api'
import type { RequestOptions } from '@/api/http'

// Allow environment overrides for driver endpoints
const ENV_DRIVER_PREFIX = ((import.meta as any).env?.VITE_DRIVER_PREFIX as string | undefined)?.replace(/\/$/, '')
const ENV_DRIVER_ALT_PREFIX = ((import.meta as any).env?.VITE_DRIVER_ALT_PREFIX as string | undefined)?.replace(/\/$/, '')
const ENV_DRIVER_PROFILE_PATH = (import.meta as any).env?.VITE_DRIVER_PROFILE_PATH as string | undefined
const ENV_DRIVER_DELIVERIES_PATH = (import.meta as any).env?.VITE_DRIVER_DELIVERIES_PATH as string | undefined
const ENV_DRIVER_VEHICLE_PATH = (import.meta as any).env?.VITE_DRIVER_VEHICLE_PATH as string | undefined

const PREFIX = ENV_DRIVER_PREFIX || '/api/driver'
const ALT_PREFIX = ENV_DRIVER_ALT_PREFIX || '/dashboard/api/driver'

function normalize(p: string): string {
  let s = p.trim()
  if (!s.startsWith('/')) s = '/' + s
  // Ensure trailing slash for consistency
  if (!s.endsWith('/')) s = s + '/'
  return s
}

type EndpointKind = 'profile' | 'deliveries' | 'vehicle'

function candidatePaths(kind: EndpointKind): string[] {
  if (kind === 'vehicle') {
    const defaults = [
      '/api/driver/profile/vehicle/',
      '/dashboard/api/driver/profile/vehicle/',
      normalize(`${PREFIX}/profile/vehicle`),
      normalize(`${ALT_PREFIX}/profile/vehicle`),
    ]
    const explicit = ENV_DRIVER_VEHICLE_PATH ? [normalize(ENV_DRIVER_VEHICLE_PATH)] : []
    return Array.from(new Set([...explicit, ...defaults]))
  }

  const envPath = kind === 'profile' ? ENV_DRIVER_PROFILE_PATH : ENV_DRIVER_DELIVERIES_PATH
  const defaults = kind === 'profile'
    ? [
        normalize(`${PREFIX}/profile`),
        normalize(`${ALT_PREFIX}/profile`),
        '/dashboard/api/driver/profile/',
        '/api/driver/profile/',
        '/api/driver/profile',
        '/drivers/api/profile/',
        '/drivers/api/driver/profile/',
      ]
    : [
        normalize(`${PREFIX}/deliveries`),
        normalize(`${ALT_PREFIX}/deliveries`),
        '/dashboard/api/driver/deliveries/',
        '/api/driver/deliveries/',
        '/api/driver/deliveries',
        '/drivers/api/deliveries/',
        '/drivers/api/driver/deliveries/',
      ]
  const list = [envPath ? normalize(envPath) : undefined, ...defaults].filter(Boolean) as string[]
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
      try {
        const toggled = p.endsWith('/') ? p.slice(0, -1) : (p + '/')
        return await http.get<T>(toggled, opts as any)
      } catch (e2: any) {
        lastErr = e2
        if (e2?.status !== 404) throw e2
      }
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

export async function getVehicle(opts?: RequestOptions): Promise<Vehicle | null> {
  const paths = candidatePaths('vehicle')
  try {
    return await getFirstOk<Vehicle>(paths, opts)
  } catch (e: any) {
    if (e?.status === 404) return null
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
