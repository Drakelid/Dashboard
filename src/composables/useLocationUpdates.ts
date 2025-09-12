import { ref, onUnmounted } from 'vue'
import { updateLocation } from '@/api/driver'

export interface LocationOptions {
  enableUpdates?: boolean
  intervalMs?: number
  minDeltaMeters?: number
}

export interface LivePosition {
  lat: number
  lng: number
  accuracy_m?: number
  heading_deg?: number | null
  speed_kph?: number | null
  timestamp: number
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return R * c
}

export function useLocationUpdates(opts?: LocationOptions) {
  const enableUpdates = opts?.enableUpdates ?? (import.meta as any).env?.VITE_ENABLE_LOCATION_UPDATES !== 'false'
  const intervalMs = Number(opts?.intervalMs ?? (import.meta as any).env?.VITE_LOCATION_UPDATE_INTERVAL_MS ?? 15000)
  const minDeltaMeters = Number(opts?.minDeltaMeters ?? (import.meta as any).env?.VITE_LOCATION_MIN_DELTA_METERS ?? 10)

  const position = ref<LivePosition | null>(null)
  const active = ref(false)
  const error = ref<string | null>(null)
  const lastSentAt = ref<number | null>(null)
  let lastSentPos: { lat: number; lng: number } | null = null
  let watchId: number | null = null
  let sending = false

  const maybeSend = async (pos: LivePosition) => {
    if (!enableUpdates) return
    const now = Date.now()
    if (lastSentAt.value != null && now - lastSentAt.value < intervalMs) return
    if (lastSentPos) {
      const moved = haversineMeters(lastSentPos, pos)
      if (moved < minDeltaMeters) return
    }
    if (sending) return
    sending = true
    try {
      await updateLocation({
        latitude: pos.lat,
        longitude: pos.lng,
        accuracy_m: pos.accuracy_m,
        heading_deg: pos.heading_deg ?? undefined,
        speed_kph: pos.speed_kph ?? undefined,
      })
      lastSentAt.value = now
      lastSentPos = { lat: pos.lat, lng: pos.lng }
    } catch (e: any) {
      // swallow errors, surface minimal info
      error.value = e?.message || 'Failed to update location'
    } finally {
      sending = false
    }
  }

  function start() {
    if (!('geolocation' in navigator)) {
      error.value = 'Geolocation not supported by this browser.'
      return
    }
    if (watchId != null) return
    active.value = true
    watchId = navigator.geolocation.watchPosition(
      (p) => {
        const speed_kph = p.coords.speed != null && Number.isFinite(p.coords.speed)
          ? Math.max(0, p.coords.speed * 3.6)
          : null
        const next: LivePosition = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy_m: p.coords.accuracy ?? undefined,
          heading_deg: p.coords.heading ?? null,
          speed_kph,
          timestamp: p.timestamp,
        }
        position.value = next
        // fire-and-forget server update respecting throttling and movement
        void maybeSend(next)
      },
      (err) => {
        error.value = err?.message || 'Unable to get location'
        active.value = false
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    ) as unknown as number
  }

  function stop() {
    if (watchId != null) {
      try { navigator.geolocation.clearWatch(watchId as number) } catch {}
      watchId = null
    }
    active.value = false
  }

  onUnmounted(() => stop())

  return { position, active, error, lastSentAt, start, stop }
}
