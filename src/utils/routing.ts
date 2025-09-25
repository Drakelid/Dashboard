import type { LatLng } from './geocode'

const CACHE_PREFIX = 'route:v1:'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24 hours
const DEFAULT_OSRM_ENDPOINT = 'https://router.project-osrm.org/route/v1/driving'

function roundCoord(value: number): number {
  return Number(value.toFixed(5))
}

function normalizeCoordinate({ lat, lng }: LatLng): string {
  return `${roundCoord(lng)},${roundCoord(lat)}`
}

function cacheKey(origin: LatLng, destination: LatLng): string {
  return `${CACHE_PREFIX}${normalizeCoordinate(origin)}->${normalizeCoordinate(destination)}`
}

function getCache(key: string): number | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value: number; timestamp: number }
    if (!parsed || typeof parsed.value !== 'number' || typeof parsed.timestamp !== 'number') return null
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null
    return parsed.value
  } catch {
    return null
  }
}

function setCache(key: string, value: number) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }))
  } catch {}
}

function resolveEndpoint(): string {
  const env = ((import.meta as any).env?.VITE_ROUTING_ENDPOINT as string | undefined)?.trim()
  if (!env) return DEFAULT_OSRM_ENDPOINT
  if (/^https?:\/\//i.test(env)) return env
  return env.startsWith('/') ? env : `/${env}`
}

function buildRequestUrl(origin: LatLng, destination: LatLng): string {
  const endpoint = resolveEndpoint()
  const originPart = `${origin.lng},${origin.lat}`
  const destinationPart = `${destination.lng},${destination.lat}`
  const query = '?overview=false&alternatives=false&steps=false'
  if (/^https?:\/\//i.test(endpoint)) {
    return `${endpoint}/${originPart};${destinationPart}${query}`
  }
  return `${endpoint}/${originPart};${destinationPart}${query}`
}

function parseRouteDistance(data: any): number | null {
  const route = data?.routes?.[0]
  if (!route) return null
  const meters = typeof route.distance === 'number' ? route.distance : Number(route.distance)
  if (!Number.isFinite(meters)) return null
  return meters / 1000
}

export async function getDrivingDistance(origin: LatLng, destination: LatLng): Promise<number | null> {
  if (!origin || !destination) return null
  const key = cacheKey(origin, destination)
  const cached = getCache(key)
  if (cached != null) return cached

  try {
    const response = await fetch(buildRequestUrl(origin, destination))
    if (!response.ok) return null
    const data = await response.json()
    const distanceKm = parseRouteDistance(data)
    if (distanceKm != null) {
      setCache(key, distanceKm)
    }
    return distanceKm
  } catch {
    return null
  }
}
