import { http } from './http'
import { getSuggestions } from './driver'
import type { PackageDelivery, PackageDeliveryRequest, PackageStatusUpdate, PackageStatusUpdateRequest } from '@/types/api'

export interface NearbyAssignment {
  id: number
  pickup_location?: string
  delivery_location?: string
  distance_km?: number
  eta_minutes?: number
}

// From SamBringNew.yaml
export interface UnassignedPackageSummary {
  id: number
  description?: string
  // Optional rich fields when backend includes them
  weight?: string | number
  weight_unit?: string
  length?: string | number
  width?: string | number
  height?: string | number
  dimension_unit?: string
  fragile?: boolean
  hazardous?: boolean
  temperature_range?: string
  temperature_unit?: string
  volume?: string | number
  volume_liters?: string | number
  delivery_status?: string
}

export interface UnassignedPackagesByDelivery {
  delivery_id: number
  uuid?: string | null
  receiver_name?: string
  receiver_phone?: string
  pickup_location: string
  // Optional coordinates when backend includes them
  pickup_latitude?: number | string
  pickup_longitude?: number | string
  delivery_location: string
  service?: string
  price?: string
  packages: UnassignedPackageSummary[]
}

export async function pickup(packageId: number, payload: PackageStatusUpdateRequest): Promise<PackageStatusUpdate> {
  return http.post<PackageStatusUpdate>(`/api/packages/${packageId}/pickup/`, payload)
}

export async function deliver(packageId: number, payload: PackageDeliveryRequest): Promise<PackageDelivery> {
  return http.post<PackageDelivery>(`/api/packages/${packageId}/deliver/`, payload)
}

function normalizeEndpoint(ep: string): string {
  let e = ep.trim()
  if (!e.startsWith('/')) e = '/' + e
  if (!e.endsWith('/')) e = e + '/'
  return e
}

function getAssignEndpointCandidates(): string[] {
  const envEp = (import.meta as any).env?.VITE_ASSIGN_ENDPOINT as string | undefined
  const candidates = [
    envEp ? normalizeEndpoint(envEp) : undefined,
    '/api/packages/assign_package/',
    '/api/assign_package/',
  ].filter(Boolean) as string[]
  // Deduplicate while preserving order
  return Array.from(new Set(candidates))
}

async function postToFirstAvailable<T = any>(body: any): Promise<T> {
  const endpoints = getAssignEndpointCandidates()
  let lastError: any
  for (const ep of endpoints) {
    try {
      return await http.post<T>(ep, body)
    } catch (e: any) {
      lastError = e
      // Try next only on 404 Not Found; otherwise rethrow
      if (e?.status !== 404) throw e
    }
  }
  throw lastError
}

export async function assignPackage(packageId: number): Promise<Record<string, unknown>> {
  return postToFirstAvailable({ package_id: packageId })
}

// Some backends expose nearby suggestions via the same assign_package endpoint
// when called with package_id: 0 and optional coordinates.
export async function fetchNearbyAssignments(opts?: { lat?: number; lng?: number; radius_km?: number }): Promise<NearbyAssignment[]> {
  const body: Record<string, any> = { package_id: 0 }
  if (opts?.lat != null && opts?.lng != null) {
    body.lat = opts.lat
    body.lng = opts.lng
  }
  if (opts?.radius_km != null) body.radius_km = opts.radius_km
  const res = await postToFirstAvailable<any>(body)
  // Be tolerant to API shape: either array directly or wrapped
  if (Array.isArray(res)) return res as NearbyAssignment[]
  if (res && Array.isArray((res as any).results)) return (res as any).results as NearbyAssignment[]
  return []
}

export async function getAvailablePackages(): Promise<UnassignedPackagesByDelivery[]> {
  try {
    return await http.get<UnassignedPackagesByDelivery[]>(`/api/packages/available_packages/`)
  } catch (e: any) {
    if (e?.status === 404) {
      // Fallback: use driver suggestions and shape to groups with no package list
      const suggestions = await getSuggestions().catch(() => []) as any[]
      return (suggestions || []).map((s: any) => ({
        delivery_id: s.delivery_id,
        uuid: null,
        receiver_name: undefined,
        receiver_phone: undefined,
        pickup_location: s.pickup_location || '',
        pickup_latitude: s.pickup_latitude,
        pickup_longitude: s.pickup_longitude,
        delivery_location: s.delivery_location || '',
        service: undefined,
        price: undefined,
        packages: [],
      }))
    }
    throw e
  }
}
