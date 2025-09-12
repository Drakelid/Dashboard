<template>
  <div ref="el" :style="{ height, width: '100%' }" class="rounded-lg overflow-hidden border"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import 'leaflet/dist/leaflet.css'

const props = withDefaults(defineProps<{
  center?: { lat: number; lng: number } | null
  markers?: Array<{ lat: number; lng: number; label?: string }>
  zoom?: number
  height?: string
}>(), {
  center: null,
  markers: () => [],
  zoom: 13,
  height: '220px',
})

const el = ref<HTMLDivElement | null>(null)
let map: any = null
let layerGroup: any = null
let Lref: any = null

async function ensureLeaflet() {
  if (Lref) return Lref
  const mod: any = await import('leaflet')
  Lref = mod.default || mod
  // Fix marker icons in bundlers by explicitly setting icon URLs
  try {
    const [iconRetina, icon, shadow] = await Promise.all([
      import('leaflet/dist/images/marker-icon-2x.png?url'),
      import('leaflet/dist/images/marker-icon.png?url'),
      import('leaflet/dist/images/marker-shadow.png?url'),
    ])
    Lref.Icon.Default.mergeOptions({
      iconRetinaUrl: (iconRetina as any).default ?? (iconRetina as any),
      iconUrl: (icon as any).default ?? (icon as any),
      shadowUrl: (shadow as any).default ?? (shadow as any),
    })
  } catch {
    // Fallback to CDN asset URLs
    const base = 'https://unpkg.com/leaflet@1.9.4/dist/images'
    Lref.Icon.Default.mergeOptions({
      iconRetinaUrl: `${base}/marker-icon-2x.png`,
      iconUrl: `${base}/marker-icon.png`,
      shadowUrl: `${base}/marker-shadow.png`,
    })
  }
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
  const center = props.center || { lat: 59.9139, lng: 10.7522 }
  map.setView([center.lat, center.lng], props.zoom)
  for (const m of props.markers || []) {
    const marker = L.marker([m.lat, m.lng])
    if (m.label) marker.bindPopup(m.label)
    marker.addTo(layerGroup)
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
</script>
