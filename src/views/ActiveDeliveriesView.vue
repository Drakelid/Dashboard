<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold">Jobs & Nearby</h2>

    <!-- Combined Map (Jobs + Nearby) -->
    <section class="rounded-xl border bg-white shadow-sm">
      <header class="p-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 class="text-lg font-semibold">Map</h3>
          <div class="mt-1 text-xs text-gray-500 flex items-center gap-4">
            <span class="inline-flex items-center gap-1"><span class="inline-block h-2 w-2 rounded-full bg-green-600"></span> Jobs</span>
            <span class="inline-flex items-center gap-1"><span class="inline-block h-2 w-2 rounded-full bg-blue-600"></span> Nearby</span>
            <span class="inline-flex items-center gap-1"><span class="inline-block h-2 w-2 rounded-full bg-gray-800"></span> You</span>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button class="h-8 px-3 tap-target rounded border bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="nearbyLoading" @click="locateAndLoadNearby">{{ nearbyLoading ? 'Locating…' : 'Use my location' }}</button>
          <button class="h-8 px-3 tap-target rounded border bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="nearbyLoading" @click="loadNearby()">Refresh</button>
        </div>
      </header>
      <div class="p-4">
        <SmallMap :center="mapCenter" :markers="mapMarkers" :openMarkerId="openMarkerId" height="280px" />
      </div>
    </section>

    <!-- Your current jobs -->
    <ActiveDeliveriesFromApi
      :items="future || []"
      :loading="deliveriesLoading"
      :error="deliveriesError"
      :showFullView="true"
      :enableActions="true"
      title="Your Jobs"
      @refresh="refreshAll"
    />

    <!-- Nearby assignments -->
    <section class="rounded-xl border bg-white shadow-sm">
      <header class="p-4 border-b flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Nearby Assignments</h3>
          <p class="text-xs text-gray-500" v-if="nearbyInfo">{{ nearbyInfo }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="h-8 px-3 rounded border bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="nearbyLoading" @click="locateAndLoadNearby">{{ nearbyLoading ? 'Locating…' : 'Use my location' }}</button>
          <button class="h-8 px-3 rounded border bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="nearbyLoading" @click="loadNearby()">Refresh</button>
        </div>
      </header>
      <div class="p-4" v-if="nearbyError">
        <div class="text-sm text-red-600">{{ nearbyError }}</div>
      </div>
      <div class="p-4 space-y-3" v-else>

        <div v-if="nearbyLoading" class="text-sm text-gray-500">Loading nearby assignments…</div>
        <div v-else-if="nearby.length === 0" class="text-sm text-gray-500">No nearby assignments right now.</div>
        <div v-else class="grid gap-3">
          <div v-for="group in nearby" :key="group.delivery_id" class="rounded-lg border p-3">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="text-sm font-semibold cursor-pointer hover:underline" @click.stop="openOnMap(group.delivery_id)">Delivery #{{ group.delivery_id }}</div>
              <div class="flex items-center gap-3 flex-wrap">
                <div class="text-xs text-gray-500" v-if="group.service || group.price">
                  <span v-if="group.service">{{ group.service }}</span>
                  <span v-if="group.service && group.price"> • </span>
                  <span v-if="group.price">{{ group.price }}</span>
                </div>
                <button
                  class="h-8 px-3 tap-target rounded border bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  @click.stop="openOnMap(group.delivery_id)"
                >
                  Show on map
                </button>
                <button
                  v-if="canAssign"
                  class="h-8 px-3 tap-target rounded border bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  :disabled="acceptingGroupId === group.delivery_id || group.packages.length === 0"
                  @click="acceptAllInGroup(group.delivery_id)"
                >
                  {{ acceptingGroupId === group.delivery_id ? 'Accepting all…' : 'Accept all' }}
                </button>
              </div>
            </div>
            <div class="mt-1 grid gap-2 md:grid-cols-2 text-sm">
              <div>
                <div class="text-gray-500">Pickup</div>
                <div class="font-medium break-words">{{ group.pickup_location || '—' }}</div>
              </div>
              <div>
                <div class="text-gray-500">Delivery</div>
                <div class="font-medium break-words">{{ group.delivery_location || '—' }}</div>
              </div>
            </div>

            <!-- Packages -->
            <div class="mt-3">
              <div class="text-xs text-gray-500 mb-1">Packages</div>
              <ul class="space-y-2">
                <li v-for="p in group.packages" :key="p.id" class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3" :class="{ 'bg-green-50 border border-green-200 rounded': acceptedIds.has(p.id) }">
                  <div class="text-sm flex-1">
                    <div>
                      <span class="font-medium">#{{ p.id }}</span>
                      <span v-if="p.description" class="text-gray-500"> — {{ p.description }}</span>
                      <span v-if="acceptedIds.has(p.id)" class="ml-2 inline-flex items-center gap-1 text-green-700 text-xs">
                        <span class="inline-block h-1.5 w-1.5 rounded-full bg-green-600"></span>
                        Accepted
                      </span>
                    </div>
                    <!-- Extra attributes -->
                    <div class="mt-1 flex flex-wrap gap-2 text-sm sm:text-xs">
                      <span v-if="p.weight != null" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        <span class="font-medium">Weight:</span>
                        <span>{{ p.weight }}{{ p.weight_unit || '' }}</span>
                      </span>
                      <span v-if="p.length != null && p.width != null && p.height != null" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        <span class="font-medium">Size:</span>
                        <span>{{ p.length }} × {{ p.width }} × {{ p.height }} {{ p.dimension_unit || '' }}</span>
                      </span>
                      <span v-if="p.fragile" class="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800">Fragile</span>
                      <span v-if="p.hazardous" class="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-800">Hazardous</span>
                      <span v-if="p.temperature_range || p.temperature_unit" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        <span class="font-medium">Temp:</span>
                        <span>{{ p.temperature_range || '' }} {{ p.temperature_unit || '' }}</span>
                      </span>
                      <span v-if="p.volume != null" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                        <span class="font-medium">Vol:</span>
                        <span>{{ p.volume }}</span>
                      </span>
                      <span v-if="p.delivery_status" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700">
                        <span class="font-medium">Status:</span>
                        <span>{{ formatStatus(p.delivery_status) }}</span>
                      </span>
                    </div>
                  </div>
                  <div class="pt-2 sm:pt-1" v-if="canAssign">
                    <template v-if="!acceptedIds.has(p.id)">
                      <button class="h-8 px-3 tap-target rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" :disabled="assigningId === p.id || acceptingGroupId === group.delivery_id" @click="acceptAssignment(p.id)">
                        {{ assigningId === p.id ? 'Accepting…' : 'Accept' }}
                      </button>
                    </template>
                  </div>
                </li>
              </ul>
              <div class="mt-2 text-xs text-gray-500" v-if="!canAssign">
                Accepting assignments is not configured on this server.
              </div>
            </div>
          </div>
        </div>

        <!-- Manual accept by ID (fallback) -->
        <div class="mt-2 pt-3 border-t text-sm" v-if="canAssign">
          <div class="flex items-center gap-2">
            <input type="number" v-model.number="manualPackageId" class="h-9 px-3 rounded border w-40" placeholder="Package ID" />
            <button class="h-9 px-3 tap-target rounded border bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="!manualPackageId || assigningId === manualPackageId" @click="acceptByManualId">Accept by ID</button>
          </div>
        </div>
        <div class="mt-2 pt-3 border-t text-xs text-gray-500" v-else>
          To enable accepting, set VITE_ASSIGN_ENDPOINT to the correct endpoint path.
        </div>
      </div>
    </section>

    <!-- New Pickup Modal -->
    <NewPickupRequestModal
      v-model="showNewPickup"
      :request="currentRequest"
      :packages="modalPackages"
      :deliveryId="modalDeliveryId"
      @accept="handleAccept"
      @decline="handleDecline"
      @expired="handleExpired"
      @accept-all="acceptAllInGroup"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, reactive, watch } from 'vue'
import ActiveDeliveriesFromApi from '@/components/ActiveDeliveriesFromApi.vue'
import NewPickupRequestModal from '@/components/NewPickupRequestModal.vue'
import SmallMap from '@/components/SmallMap.vue'
import type { NewPickupRequest } from '@/types/pickups'
import { addNewPickupListener, emitNewPickupRequest } from '@/utils/pickupEvents'
import { useDriverDeliveries } from '@/composables/useDriverDeliveries'
import { assignPackage, getAvailablePackages, type UnassignedPackagesByDelivery } from '@/api/packages'
import { setJobsCount, setNearbyCount } from '@/stores/counters'
import { geocodeAddress } from '@/utils/geocode'
import { useLocationUpdates } from '@/composables/useLocationUpdates'

const { future, loading: deliveriesLoading, error: deliveriesError, loadFuture, refresh } = useDriverDeliveries()

// Nearby assignments state (from available packages per SamBringNew.yaml)
interface NearbyGroup {
  delivery_id: number
  uuid?: string | null
  pickup_location: string
  delivery_location: string
  receiver_name?: string
  receiver_phone?: string
  service?: string
  price?: string
  pickup_lat?: number
  pickup_lng?: number
  packages: Array<{
    id: number
    description?: string
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
    delivery_status?: string
  }>
}
const nearby = ref<NearbyGroup[]>([])
const nearbyLoading = ref(false)
const nearbyError = ref<string | null>(null)
const coords = ref<{ lat?: number; lng?: number }>({})
const jobCoords = reactive<Record<string, { lat: number; lng: number }>>({})
const openMarkerId = ref<string | number | null>(null)
const manualPackageId = ref<number | null>(null)
const assigningId = ref<number | null>(null)
const acceptingGroupId = ref<number | null>(null)
// Track recently accepted package IDs for visual feedback
const acceptedIds = reactive(new Set<number>())
// Track packages we've already surfaced in the new pickup modal to avoid repeat prompts
const seenPickupPackageIds = reactive(new Set<number>())
const nearbyInfo = computed(() => {
  if (coords.value.lat != null && coords.value.lng != null) return `Using location: ${coords.value.lat.toFixed(4)}, ${coords.value.lng.toFixed(4)}`
  return 'Showing suggestions without precise location'
})

// Auto-refresh nearby every 60s (override with VITE_NEARBY_REFRESH_MS)
const nearbyRefreshMs = Number((import.meta as any).env?.VITE_NEARBY_REFRESH_MS ?? 60000)
let nearbyTimer: number | null = null
function startNearbyAutoRefresh() {
  if (nearbyTimer != null) return
  nearbyTimer = window.setInterval(() => {
    if (!nearbyLoading.value) void loadNearby()
  }, Math.max(5000, nearbyRefreshMs))
}
function stopNearbyAutoRefresh() {
  if (nearbyTimer != null) {
    clearInterval(nearbyTimer)
    nearbyTimer = null
  }
}
function onVisibilityChange() {
  if (document.hidden) stopNearbyAutoRefresh()
  else startNearbyAutoRefresh()
}

// Accept action is only available when an assign endpoint is configured
// Assign endpoint exists per spec (/api/packages/assign_package/)
const canAssign = computed(() => true)

const mapCenter = computed(() => {
  if (coords.value.lat != null && coords.value.lng != null) return { lat: coords.value.lat, lng: coords.value.lng }
  const firstNearby = nearby.value.find(n => n.pickup_lat != null && n.pickup_lng != null)
  if (firstNearby && firstNearby.pickup_lat != null && firstNearby.pickup_lng != null) return { lat: firstNearby.pickup_lat, lng: firstNearby.pickup_lng }
  const jobs = Object.values(jobCoords)
  if (jobs.length > 0) return jobs[0]
  return { lat: 59.9139, lng: 10.7522 }
})

const mapMarkers = computed(() => {
  const markers: Array<{ id?: string | number; lat: number; lng: number; label?: string; kind?: 'user' | 'job' | 'nearby' }> = []
  // Current location marker
  if (coords.value.lat != null && coords.value.lng != null) {
    markers.push({ lat: coords.value.lat, lng: coords.value.lng, label: 'You are here', kind: 'user' })
  }
  // Current jobs markers (pickup address preferred; fallback to delivery)
  for (const it of future.value || []) {
    const addr = it.pickup_location || it.delivery?.delivery_location || it.location
    const key = `job:${addr || it.date || ''}:${it.time || ''}`
    const pos = key ? jobCoords[key] : undefined
    if (pos) {
      markers.push({ id: key, lat: pos.lat, lng: pos.lng, label: `Job ${it.delivery?.id ? '#' + it.delivery.id : ''} ${addr ? '— ' + addr : ''}`.trim(), kind: 'job' })
    }
  }
  // Add pickup markers when coordinates are present
  for (const n of nearby.value) {
    if (n.pickup_lat != null && n.pickup_lng != null) {
      markers.push({ id: n.delivery_id, lat: n.pickup_lat, lng: n.pickup_lng, label: `Delivery #${n.delivery_id}`, kind: 'nearby' })
    }
  }
  return markers
})

function isAssignableStatus(status: unknown): boolean {
  if (status == null) return true
  const value = String(status).toLowerCase()
  if (value.includes('delivered')) return false
  if (value.includes('picked_up')) return false
  if (value.includes('cancel')) return false
  if (value.includes('return')) return false
  if (value.includes('completed')) return false
  return true
}

async function loadNearby() {
  nearbyLoading.value = true
  nearbyError.value = null
  try {
    const groups = await getAvailablePackages()
    const list: NearbyGroup[] = []
    const groupsWithNewPackages: NearbyGroup[] = []
    const nextSeen = new Set<number>()
    for (const g of groups as UnassignedPackagesByDelivery[]) {
      const rawLat: any = (g as any).pickup_latitude
      const rawLng: any = (g as any).pickup_longitude
      const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : (typeof rawLat === 'number' ? rawLat : undefined)
      const lng = typeof rawLng === 'string' ? parseFloat(rawLng) : (typeof rawLng === 'number' ? rawLng : undefined)
      const readyPackages = (g.packages || [])
        .filter(p => isAssignableStatus((p as any).delivery_status))
        .map(p => ({
          id: p.id,
          description: p.description,
          weight: (p as any).weight,
          weight_unit: (p as any).weight_unit,
          length: (p as any).length,
          width: (p as any).width,
          height: (p as any).height,
          dimension_unit: (p as any).dimension_unit,
          fragile: (p as any).fragile,
          hazardous: (p as any).hazardous,
          temperature_range: (p as any).temperature_range,
          temperature_unit: (p as any).temperature_unit,
          volume: (p as any).volume ?? (p as any).volume_liters,
          delivery_status: (p as any).delivery_status,
        }))

      const groupEntry: NearbyGroup = {
        delivery_id: g.delivery_id,
        uuid: g.uuid,
        pickup_location: g.pickup_location,
        delivery_location: g.delivery_location,
        receiver_name: (g as any).receiver_name,
        receiver_phone: (g as any).receiver_phone,
        service: (g as any).service,
        price: (g as any).price,
        pickup_lat: Number.isFinite(lat as number) ? (lat as number) : undefined,
        pickup_lng: Number.isFinite(lng as number) ? (lng as number) : undefined,
        packages: readyPackages,
      }

      let groupHasNewPackage = false
      for (const pkg of readyPackages) {
        if (pkg?.id != null) {
          nextSeen.add(pkg.id)
          if (!seenPickupPackageIds.has(pkg.id) && !acceptedIds.has(pkg.id)) {
            groupHasNewPackage = true
          }
        }
      }

      if (groupHasNewPackage) groupsWithNewPackages.push(groupEntry)

      list.push(groupEntry)
    }
    nearby.value = list
    seenPickupPackageIds.clear()
    nextSeen.forEach(id => seenPickupPackageIds.add(id))
    if (
      canShowNewPickup.value &&
      !showNewPickup.value &&
      groupsWithNewPackages.length > 0
    ) {
      triggerPickupModal(groupsWithNewPackages[0])
    }
    // Update badge counts: sum of packages across groups
    const totalPackages = list.reduce((acc, g) => acc + (g.packages?.length || 0), 0)
    setNearbyCount(totalPackages)
    // Geocode fallback for missing pickup coordinates (gentle, sequential)
    for (const group of nearby.value) {
      if ((group.pickup_lat == null || group.pickup_lng == null) && group.pickup_location) {
        const res = await geocodeAddress(group.pickup_location)
        if (res) {
          group.pickup_lat = res.lat
          group.pickup_lng = res.lng
        }
      }
    }
  } catch (e: any) {
    nearbyError.value = e?.message || 'Failed to load nearby assignments'
    nearby.value = []
    setNearbyCount(0)
  } finally {
    nearbyLoading.value = false
  }
}

function openOnMap(deliveryId: number) {
  openMarkerId.value = deliveryId
}

function locateAndLoadNearby() {
  // Start continuous location updates and then refresh nearby
  startLive()
  void loadNearby()
}

async function acceptAssignment(id: number) {
  assigningId.value = id
  try {
    await assignPackage(id)
    acceptedIds.add(id)
    setTimeout(() => acceptedIds.delete(id), 4000)
    // Refresh both lists
    await Promise.allSettled([refresh(), loadNearby()])
    setJobsCount((future.value?.length as number) || 0)
    const totalPackages = nearby.value.reduce((acc, g) => acc + (g.packages?.length || 0), 0)
    setNearbyCount(totalPackages)
  } catch (e: any) {
    nearbyError.value = e?.message || 'Failed to accept assignment'
  } finally {
    assigningId.value = null
  }
}

async function acceptAllInGroup(deliveryId: number) {
  const group = nearby.value.find(g => g.delivery_id === deliveryId)
  if (!group || !group.packages?.length) return
  acceptingGroupId.value = deliveryId
  try {
    // Sequentially assign to reduce server load
    for (const p of group.packages) {
      try {
        await assignPackage(p.id)
        acceptedIds.add(p.id)
        setTimeout(() => acceptedIds.delete(p.id), 4000)
      } catch (e) {
        // Continue with next; collect errors into nearbyError for visibility
        const msg = (e as any)?.message || 'Failed to accept a package'
        nearbyError.value = msg
      }
    }
    await Promise.allSettled([refresh(), loadNearby()])
    setJobsCount((future.value?.length as number) || 0)
    const totalPackages = nearby.value.reduce((acc, g) => acc + (g.packages?.length || 0), 0)
    setNearbyCount(totalPackages)
  } finally {
    acceptingGroupId.value = null
  }
}

function acceptByManualId() {
  if (manualPackageId.value == null) return
  acceptAssignment(manualPackageId.value)
}

// Only allow new pickup requests when there are active (future) deliveries
const canShowNewPickup = computed(() => (future.value?.length || 0) > 0)

const showNewPickup = ref(false)
const currentRequest = ref<NewPickupRequest>({
  priority: 'standard',
  pickup: { name: '', address: '' },
  dropoff: { name: '', address: '' },
  etaMinutes: 0,
  distanceKm: 0,
  dimensions: '',
  weightKg: 0,
  volumeL: 0,
  feeKr: 0,
  expiresInSeconds: 0,
})

let pickupOpenTimer: number | null = null

const removeListener = addNewPickupListener((req) => {
  // Clear any pending open from a previous request
  if (pickupOpenTimer != null) {
    clearTimeout(pickupOpenTimer)
    pickupOpenTimer = null
  }
  // Seed request; only open when a matching group exists AND has packages (ready_for_pickup)
  let finalReq = req
  let attempts = 0
  const openWhenReady = () => {
    attempts += 1
    // Try to resolve candidate and enrich
    const cand = findModalCandidate(finalReq)
    if (cand && Array.isArray(cand.packages)) {
      // Exclude locally accepted packages to avoid prompting on already accepted
      const visible = cand.packages.filter(p => !acceptedIds.has(p.id))
      if (visible.length > 0) {
        if (finalReq.deliveryId == null) finalReq = { ...finalReq, deliveryId: cand.delivery_id }
        finalReq = enrichRequestFromGroup(finalReq, cand)
        currentRequest.value = finalReq
        showNewPickup.value = true
        pickupOpenTimer = null
        return
      }
    }
    if (attempts >= 10) {
      // Give up without opening the modal
      pickupOpenTimer = null
      return
    }
    pickupOpenTimer = window.setTimeout(openWhenReady, 300)
  }
  // Start the check loop
  openWhenReady()
})

onUnmounted(() => removeListener())
onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  stopNearbyAutoRefresh()
})
onUnmounted(() => {
  if (pickupOpenTimer != null) {
    clearTimeout(pickupOpenTimer)
    pickupOpenTimer = null
  }
})

// Dev-time demo trigger - only when allowed based on API data
onMounted(async () => {
  // Kick off jobs and nearby in parallel where possible
  const futurePromise = loadFuture()
  // Load nearby immediately in the background (do not block UI)
  void loadNearby()
  // After jobs load, geocode their addresses and update counts
  await futurePromise
  await geocodeJobs()
  setJobsCount((future.value?.length as number) || 0)
  // Always start live GPS updates (permission will be requested)
  startLive()
  // Start auto-refresh and handle page visibility
  startNearbyAutoRefresh()
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (import.meta.env.DEV) {
    setTimeout(() => {
      // Only emit demo pickup if there's a nearby group with ready_for_pickup packages
      const g = nearby.value.find(gr => Array.isArray(gr.packages) && gr.packages.length > 0)
      if (!g) return
      emitNewPickupRequest({
        priority: 'standard',
        pickup: { name: g.receiver_name || 'Pickup', address: g.pickup_location },
        dropoff: { name: g.receiver_name || 'Receiver', address: g.delivery_location },
        etaMinutes: 11,
        distanceKm: 1.0,
        dimensions: '29 × 20 × 11 cm',
        weightKg: 2.2,
        volumeL: 6.4,
        feeKr: 75,
        expiresInSeconds: 150, // 2:30
        deliveryId: g.delivery_id,
      })
    }, 800)
  }
})

async function refreshAll() {
  await Promise.allSettled([loadFuture()])
  await geocodeJobs()
  await loadNearby()
  setJobsCount((future.value?.length as number) || 0)
  const totalPackages = nearby.value.reduce((acc, g) => acc + (g.packages?.length || 0), 0)
  setNearbyCount(totalPackages)
}

function handleAccept(req: NewPickupRequest) {
  // TODO: Assign to driver and refresh list
  console.log('Accepted pickup', req)
}
function handleDecline(req: NewPickupRequest) {
  console.log('Declined pickup', req)
}
function handleExpired(req: NewPickupRequest) {
  console.log('Pickup expired', req)
}

function jobKey(it: any) {
  const addr = it.pickup_location || it.delivery?.delivery_location || it.location
  return `job:${addr || it.date || ''}:${it.time || ''}`
}

async function geocodeJobs() {
  for (const it of future.value || []) {
    const key = jobKey(it)
    if (!key || jobCoords[key]) continue
    const addr = it.pickup_location || it.delivery?.delivery_location || it.location
    if (!addr) continue
    const pos = await geocodeAddress(addr)
    if (pos) jobCoords[key] = pos
  }
}

// Live GPS updates: push to backend and update UI coords
const { position: livePos, error: liveErr, start: startLive } = useLocationUpdates()
watch(livePos, (p) => {
  if (p) coords.value = { lat: p.lat, lng: p.lng }
})
watch(liveErr, (msg) => {
  if (msg) nearbyError.value = msg
})

// Matching helper for modal to find the relevant nearby group (prefer explicit deliveryId)
function findModalCandidate(reqOverride?: NewPickupRequest) {
  const req = reqOverride ?? currentRequest.value
  if (!req) return undefined
  // Prefer id when provided
  if (req.deliveryId != null) {
    return nearby.value.find(g => g.delivery_id === req.deliveryId)
  }
  // Robust matching by normalized token similarity
  const normalize = (s?: string) => (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, ' ') // remove punctuation -> spaces
    .replace(/\s+/g, ' ') // collapse spaces
    .trim()
  const tokens = (s?: string) => new Set(normalize(s).split(' ').filter(t => t.length > 2))
  const jaccard = (a: Set<string>, b: Set<string>) => {
    if (!a.size || !b.size) return 0
    let inter = 0
    for (const t of a) if (b.has(t)) inter++
    return inter / (a.size + b.size - inter)
  }
  const pTokens = tokens(req.pickup?.address)
  const dTokens = tokens(req.dropoff?.address)
  let best: typeof nearby.value[number] | undefined
  let bestScore = 0
  for (const g of nearby.value) {
    const gpT = tokens(g.pickup_location)
    const gdT = tokens(g.delivery_location)
    const sp = pTokens.size ? jaccard(pTokens, gpT) : 0
    const sd = dTokens.size ? jaccard(dTokens, gdT) : 0
    // Combined score; small bonus if any direct substring match exists
    const gp = normalize(g.pickup_location)
    const gd = normalize(g.delivery_location)
    const rp = normalize(req.pickup?.address)
    const rd = normalize(req.dropoff?.address)
    const bonus = (rp && gp.includes(rp) || rp && rp.includes(gp) ? 0.2 : 0) + (rd && gd.includes(rd) || rd && rd.includes(gd) ? 0.2 : 0)
    const score = (sp + sd) / 2 + bonus
    if (score > bestScore) {
      bestScore = score
      best = g
    }
  }
  // If similarity is too low, fall back to nearest group (by pickup coords) or first group
  if (bestScore < 0.15) {
    if (nearby.value.length === 0) return undefined
    // Prefer nearest by pickup coordinates when available
    const hasCoord = (g: any) => g?.pickup_lat != null && g?.pickup_lng != null
    const cur = coords.value
    if (cur?.lat != null && cur?.lng != null && nearby.value.some(hasCoord)) {
      let nearest = nearby.value.find(hasCoord)!
      let bestD = Infinity
      for (const g of nearby.value) {
        if (!hasCoord(g)) continue
        const d = haversineKm(cur.lat, cur.lng, g.pickup_lat, g.pickup_lng)
        if (d < bestD) { bestD = d; nearest = g }
      }
      return nearest
    }
    // Otherwise just return the first group
    return nearby.value[0]
  }
  return best
}

// Try to find matching nearby group for the popup to show real packages
const modalPackages = computed(() => findModalCandidate()?.packages || [])
const modalDeliveryId = computed(() => currentRequest.value?.deliveryId ?? findModalCandidate()?.delivery_id)

// ---- Enrichment helpers to replace placeholder content with real data ----
function parseNum(n: any): number | null { if (n == null) return null; const s = typeof n === 'string' ? n.replace(/,(?=\d)/g, '.').trim() : n; const v = typeof s === 'number' ? s : parseFloat(String(s)); return Number.isFinite(v) ? v : null }
function toKg(value: number, unit?: string): number {
  const u = (unit || '').toLowerCase()
  if (u === 'g' || u === 'gram' || u === 'grams') return value / 1000
  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') return value * 0.453592
  return value // assume kg
}
function volumeLitersFromDims(p: any): number | null {
  const L = parseNum(p?.length); const W = parseNum(p?.width); const H = parseNum(p?.height)
  if (L == null || W == null || H == null) return null
  // Convert dims to cm first
  const unit = (p?.dimension_unit || '').toLowerCase()
  const toCm = (v: number) => unit === 'mm' ? v / 10 : unit === 'm' ? v * 100 : unit === 'in' || unit === 'inch' || unit === 'inches' ? v * 2.54 : v
  const lcm = toCm(L), wcm = toCm(W), hcm = toCm(H)
  return (lcm * wcm * hcm) / 1000 // cm^3 to liters
}
function firstDimsString(group: any): string | null {
  for (const p of group?.packages || []) {
    if (p?.length != null && p?.width != null && p?.height != null) {
      const unit = p.dimension_unit || 'cm'
      return `${p.length} × ${p.width} × ${p.height} ${unit}`
    }
  }
  return null
}
function sumWeightKg(group: any): number | null {
  let total = 0; let found = false
  for (const p of group?.packages || []) {
    const w = parseNum(p?.weight)
    if (w != null) { total += toKg(w, p?.weight_unit); found = true }
  }
  return found ? Math.max(0, total) : null
}
function sumVolumeL(group: any): number | null {
  let total = 0; let found = false
  for (const p of group?.packages || []) {
    const v = parseNum(p?.volume)
    const calc = v != null ? v : volumeLitersFromDims(p)
    if (calc != null) { total += calc; found = true }
  }
  return found ? Math.max(0, total) : null
}
function parseKr(price?: string): number | null {
  if (!price) return null
  const m = price.replace(/[^0-9,\.]/g, '').replace(/,(?=\d{2}\b)/, '.').match(/\d+(?:\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}
function formatStatus(s?: string): string {
  return String(s || '').replace(/_/g, ' ')
}
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => d * Math.PI / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2
  return 2 * R * Math.asin(Math.sqrt(a))
}
function enrichRequestFromGroup(req: NewPickupRequest, group: any): NewPickupRequest {
  const enriched: NewPickupRequest = { ...req }
  // Align addresses/names with the matched group
  if (group?.pickup_location) {
    enriched.pickup = {
      name: group?.receiver_name || enriched.pickup?.name || 'Pickup',
      address: group.pickup_location,
    }
  }
  if (group?.delivery_location) {
    enriched.dropoff = {
      name: group?.receiver_name || enriched.dropoff?.name || 'Receiver',
      address: group.delivery_location,
    }
  }
  const dims = firstDimsString(group); if (dims) enriched.dimensions = dims
  const wkg = sumWeightKg(group); if (wkg != null) enriched.weightKg = Math.round(wkg * 10) / 10
  const vol = sumVolumeL(group); if (vol != null) enriched.volumeL = Math.round(vol)
  const fee = parseKr(group?.price); if (fee != null) enriched.feeKr = Math.round(fee)
  // Distance/ETA if we have coordinates
  if (coords.value?.lat != null && coords.value?.lng != null && group?.pickup_lat != null && group?.pickup_lng != null) {
    const dist = haversineKm(coords.value.lat, coords.value.lng, group.pickup_lat, group.pickup_lng)
    enriched.distanceKm = Math.round(dist * 10) / 10
    const avgKmh = 25 // conservative urban average
    enriched.etaMinutes = Math.max(1, Math.round((dist / avgKmh) * 60))
  }
  return enriched
}

function ensureRequestDefaults(req: NewPickupRequest): NewPickupRequest {
  const safe = { ...req }
  safe.priority = safe.priority || 'standard'
  safe.pickup = {
    name: safe.pickup?.name || 'Pickup',
    address: safe.pickup?.address || 'Unknown pickup location',
  }
  safe.dropoff = {
    name: safe.dropoff?.name || 'Receiver',
    address: safe.dropoff?.address || 'Unknown delivery location',
  }
  safe.distanceKm = Number.isFinite(safe.distanceKm) && safe.distanceKm > 0 ? Math.round(safe.distanceKm * 10) / 10 : 1
  safe.etaMinutes = Number.isFinite(safe.etaMinutes) && safe.etaMinutes > 0 ? Math.round(safe.etaMinutes) : 10
  safe.dimensions = safe.dimensions || 'Not specified'
  safe.weightKg = Number.isFinite(safe.weightKg) && safe.weightKg >= 0 ? Math.round(safe.weightKg * 10) / 10 : 0
  safe.volumeL = Number.isFinite(safe.volumeL) && safe.volumeL >= 0 ? Math.round(safe.volumeL) : 0
  safe.feeKr = Number.isFinite(safe.feeKr) && safe.feeKr >= 0 ? Math.round(safe.feeKr) : 0
  safe.expiresInSeconds = Number.isFinite(safe.expiresInSeconds) && safe.expiresInSeconds > 0 ? Math.round(safe.expiresInSeconds) : 180
  return safe
}

function triggerPickupModal(group: NearbyGroup) {
  if (!group) return
  let base: NewPickupRequest = {
    priority: 'standard',
    pickup: {
      name: group.receiver_name || 'Pickup',
      address: group.pickup_location || 'Unknown pickup location',
    },
    dropoff: {
      name: group.receiver_name || 'Receiver',
      address: group.delivery_location || 'Unknown delivery location',
    },
    etaMinutes: 10,
    distanceKm: 1,
    dimensions: '',
    weightKg: 0,
    volumeL: 0,
    feeKr: 0,
    expiresInSeconds: 180,
    deliveryId: group.delivery_id,
  }
  base = enrichRequestFromGroup(base, group)
  const sanitized = ensureRequestDefaults(base)
  emitNewPickupRequest(sanitized)
}

// When the modal is shown but deliveryId is missing, attach it as soon as we can
watch([showNewPickup, nearby], () => {
  if (!showNewPickup.value) return
  if (currentRequest.value && currentRequest.value.deliveryId == null) {
    const cand = findModalCandidate()
    if (cand) currentRequest.value = enrichRequestFromGroup({ ...currentRequest.value, deliveryId: cand.delivery_id }, cand)
  }
})
</script>
