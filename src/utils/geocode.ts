// Simple geocoding helper using OpenStreetMap Nominatim with localStorage caching
// Respect Nominatim usage policy: keep requests low and cache results.

export type LatLng = { lat: number; lng: number }

const CACHE_PREFIX = 'geocode:v1:'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

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

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const cached = getCache(address)
  if (cached) return cached

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    address,
  )}`
  try {
    const res = await fetch(url, {
      headers: {
        // Accept-Language can help better results; User-Agent cannot be set by browsers
        'Accept-Language': navigator.language || 'en',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<any>
    if (!Array.isArray(data) || data.length === 0) return null
    const first = data[0]
    const lat = parseFloat(first.lat)
    const lng = parseFloat(first.lon)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const v = { lat, lng }
      setCache(address, v)
      return v
    }
  } catch {
    // ignore
  }
  return null
}
