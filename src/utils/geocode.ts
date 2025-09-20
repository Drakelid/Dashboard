// Simple geocoding helper using OpenStreetMap Nominatim with localStorage caching
// Respect Nominatim usage policy: keep requests low and cache results.

export type LatLng = { lat: number; lng: number }

const CACHE_PREFIX = 'geocode:v1:'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days
const FALLBACK_ENDPOINT = 'https://nominatim.openstreetmap.org/search'

function cacheKey(q: string) {
  return CACHE_PREFIX + q.trim().toLowerCase()
}

function getCache(q: string): LatLng | null {
  try {
    const raw = localStorage.getItem(cacheKey(q))
    if (!raw) return null
    const obj = JSON.parse(raw) as { v: LatLng; t: number }
    if (!obj || !obj.v || !obj.t) return null
    if (Date.now() - obj.t > CACHE_TTL_MS) return null
    return obj.v
  } catch {
    return null
  }
}

function setCache(q: string, v: LatLng) {
  try {
    localStorage.setItem(cacheKey(q), JSON.stringify({ v, t: Date.now() }))
  } catch {}
}

function resolveEndpoint(): string {
  const env = ((import.meta as any).env?.VITE_GEOCODE_ENDPOINT as string | undefined)?.trim()
  if (!env) return '/api/geocode'
  if (/^https?:\/\//i.test(env)) return env
  return env.startsWith('/') ? env : `/${env}`
}

function buildRequestUrl(address: string): string {
  const endpoint = resolveEndpoint()
  const isAbsolute = /^https?:\/\//i.test(endpoint)
  try {
    const url = isAbsolute ? new URL(endpoint) : new URL(endpoint, window.location.origin)
    url.searchParams.set('q', address)
    url.searchParams.set('limit', '1')
    return url.toString()
  } catch {
    // Fallback to raw OpenStreetMap endpoint if URL construction fails
    const fallback = new URL(FALLBACK_ENDPOINT)
    fallback.searchParams.set('format', 'jsonv2')
    fallback.searchParams.set('limit', '1')
    fallback.searchParams.set('q', address)
    return fallback.toString()
  }
}

async function fetchGeocode(address: string): Promise<LatLng | null> {
  const requestUrl = buildRequestUrl(address)
  try {
    const res = await fetch(requestUrl, {
      headers: {
        'Accept-Language': navigator.language || 'en',
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      // Fallback to direct OpenStreetMap when proxy unavailable (e.g. local preview)
      if (!requestUrl.startsWith('https://nominatim.')) {
        const fallback = new URL(FALLBACK_ENDPOINT)
        fallback.searchParams.set('format', 'jsonv2')
        fallback.searchParams.set('limit', '1')
        fallback.searchParams.set('q', address)
        const direct = await fetch(fallback.toString(), {
          headers: {
            'Accept-Language': navigator.language || 'en',
            Accept: 'application/json',
          },
        })
        if (!direct.ok) return null
        return parseGeocode(await direct.json(), address)
      }
      return null
    }
    const data = await res.json()
    return parseGeocode(data, address)
  } catch {
    return null
  }
}

function parseGeocode(data: any, address: string): LatLng | null {
  if (!Array.isArray(data) || data.length === 0) return null
  const first = data[0]
  const lat = parseFloat(first.lat)
  const lng = parseFloat(first.lon)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const v = { lat, lng }
    setCache(address, v)
    return v
  }
  return null
}

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const cached = getCache(address)
  if (cached) return cached
  return fetchGeocode(address)
}
