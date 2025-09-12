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
let markerIndex: Array<{ id?: string | number; marker: any }> = []
let defaultIcon: any = null

async function ensureLeaflet() {
  if (Lref) return Lref
  const mod: any = await import('leaflet')
  Lref = mod.default || mod
  // Fix marker icons using Vite-served URLs; avoid Leaflet imagePath
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
  const fallback = props.center || { lat: 59.9139, lng: 10.7522 } // Oslo fallback
  map = L.map(el.value).setView([fallback.lat, fallback.lng], props.zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)
  layerGroup = L.layerGroup().addTo(map)
  updateLayers()
}

function updateLayers() {
  if (!map || !Lref) return
  const L = Lref
  layerGroup.clearLayers()
  markerIndex = []
  const center = props.center || { lat: 59.9139, lng: 10.7522 }
  map.setView([center.lat, center.lng], props.zoom)
  for (const m of props.markers || []) {
    let marker: any
    if (m.kind && m.kind !== 'user') {
      const color = m.color || (m.kind === 'job' ? '#16a34a' : '#2563eb')
      marker = L.circleMarker([m.lat, m.lng], {
        radius: 7,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9,
      })
    } else {
      marker = L.marker([m.lat, m.lng], defaultIcon ? { icon: defaultIcon } : undefined)
    }
    if (m.label) marker.bindPopup(m.label)
    marker.addTo(layerGroup)
    markerIndex.push({ id: m.id, marker })
  }
  maybeOpenMarker()
}

function maybeOpenMarker() {
  if (!props.openMarkerId || !markerIndex.length) return
  const found = markerIndex.find(x => x.id === props.openMarkerId)
  if (found) {
    try {
      found.marker.openPopup()
      const ll = found.marker.getLatLng()
      if (ll) map.panTo(ll)
    } catch {}
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
})

watch(() => [props.center?.lat, props.center?.lng, props.zoom], () => {
  updateLayers()
})

watch(() => props.markers, () => {
  updateLayers()
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
