<template>
  <div ref="el" :style="{ height, width: '100%' }" class="relative z-0 rounded-lg overflow-hidden border"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import 'leaflet/dist/leaflet.css'
import marker2xUrl from 'leaflet/dist/images/marker-icon-2x.png?url'
import markerUrl from 'leaflet/dist/images/marker-icon.png?url'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png?url'

const props = withDefaults(defineProps<{
  center?: { lat: number; lng: number } | null
  markers?: Array<{ lat: number; lng: number; label?: string; id?: string | number; kind?: 'user' | 'job' | 'nearby'; color?: string }>
  zoom?: number
  height?: string
  openMarkerId?: string | number | null
}>(), {
  center: null,
  markers: () => [],
  zoom: 13,
  height: '220px',
  openMarkerId: null,
})

const el = ref<HTMLDivElement | null>(null)
let map: any = null
let layerGroup: any = null
let Lref: any = null
let defaultIcon: any = null
let markersMap = new Map<string, { marker: any; type: 'circle' | 'default'; id?: string | number }>()
let lastPropCenter: { lat: number; lng: number } | null = null
let lastPropZoom: number | null = null
let programmaticMove = false

async function ensureLeaflet() {
  if (Lref) return Lref
  const mod: any = await import('leaflet')
  Lref = mod.default || mod
  try { (Lref.Icon.Default as any).imagePath = undefined } catch {}
  try { delete (Lref.Icon.Default.prototype as any)._getIconUrl } catch {}
  defaultIcon = Lref.icon({
    iconRetinaUrl: marker2xUrl as unknown as string,
    iconUrl: markerUrl as unknown as string,
    shadowUrl: markerShadowUrl as unknown as string,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  })
  return Lref
}

async function initMap() {
  const L = await ensureLeaflet()
  if (!el.value) return
  const fallback = props.center || { lat: 59.9139, lng: 10.7522 }
  map = L.map(el.value).setView([fallback.lat, fallback.lng], props.zoom)
  lastPropCenter = props.center ? { ...props.center } : null
  lastPropZoom = props.zoom
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)
  layerGroup = L.layerGroup().addTo(map)
  map.on('moveend', () => {
    programmaticMove = false
  })
  syncMarkers()
  if (props.center) syncCenter(true)
}

function markerKey(marker: { id?: string | number; lat: number; lng: number }, index: number) {
  if (marker.id != null) return String(marker.id)
  return `${index}:${marker.lat}:${marker.lng}`
}

function syncCenter(force = false) {
  if (!map) return
  const target = props.center
  if (!target) return
  const changed =
    !lastPropCenter ||
    Math.abs(lastPropCenter.lat - target.lat) > 1e-6 ||
    Math.abs(lastPropCenter.lng - target.lng) > 1e-6
  if (!changed && !force) return
  programmaticMove = true
  map.setView([target.lat, target.lng], typeof props.zoom === 'number' ? props.zoom : map.getZoom())
  lastPropCenter = { ...target }
  lastPropZoom = props.zoom
}

function syncZoom() {
  if (!map) return
  if (typeof props.zoom !== 'number') return
  if (lastPropZoom === props.zoom) return
  programmaticMove = true
  map.setZoom(props.zoom)
  lastPropZoom = props.zoom
}

function syncMarkers() {
  if (!map || !Lref || !layerGroup) return
  const next = new Map<string, { marker: any; type: 'circle' | 'default'; id?: string | number }>()
  const markers = props.markers || []
  markers.forEach((m, index) => {
    const key = markerKey(m, index)
    const existing = markersMap.get(key)
    const color = m.color || (m.kind === 'job' ? '#16a34a' : m.kind === 'nearby' ? '#2563eb' : '#2563eb')
    if (existing) {
      existing.marker.setLatLng([m.lat, m.lng])
      if (existing.type === 'circle') {
        existing.marker.setStyle({ color, fillColor: color })
      }
      if (m.label) {
        existing.marker.bindPopup(m.label)
      } else if (existing.marker.getPopup()) {
        existing.marker.unbindPopup()
      }
      existing.id = m.id
      next.set(key, existing)
      markersMap.delete(key)
      return
    }

    let marker: any
    if (m.kind && m.kind !== 'user') {
      marker = Lref.circleMarker([m.lat, m.lng], {
        radius: 7,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9,
      })
      marker.addTo(layerGroup)
    } else {
      marker = Lref.marker([m.lat, m.lng], defaultIcon ? { icon: defaultIcon } : undefined)
      marker.addTo(layerGroup)
    }
    if (m.label) marker.bindPopup(m.label)
    next.set(key, { marker, type: m.kind && m.kind !== 'user' ? 'circle' : 'default', id: m.id })
  })

  markersMap.forEach(entry => {
    try {
      layerGroup.removeLayer(entry.marker)
    } catch {}
  })

  markersMap = next
  maybeOpenMarker()
}

function maybeOpenMarker() {
  if (!props.openMarkerId || !markersMap.size) return
  for (const entry of markersMap.values()) {
    if (entry.id === props.openMarkerId) {
      try {
        entry.marker.openPopup()
        const ll = entry.marker.getLatLng?.()
        if (ll) {
          programmaticMove = true
          map.panTo(ll)
        }
      } catch {}
      break
    }
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  markersMap.clear()
  layerGroup = null
})

watch(() => props.center, () => {
  syncCenter()
}, { deep: true })

watch(() => props.zoom, () => {
  syncZoom()
})

watch(() => props.markers, () => {
  syncMarkers()
}, { deep: true })

watch(() => props.openMarkerId, () => {
  maybeOpenMarker()
})
</script>

<style scoped>
/* Ensure map layers and controls sit behind app overlays/modals */
:deep(.leaflet-container) { z-index: 0 !important; }
:deep(.leaflet-pane) { z-index: 0 !important; }
:deep(.leaflet-control-container) { z-index: 0 !important; }
</style>
