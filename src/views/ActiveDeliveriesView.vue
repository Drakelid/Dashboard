<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold">Jobs & Nearby</h2>

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
        <!-- Small map -->
        <SmallMap :center="mapCenter" :markers="mapMarkers" height="220px" />

        <div v-if="nearbyLoading" class="text-sm text-gray-500">Loading nearby assignments…</div>
        <div v-else-if="nearby.length === 0" class="text-sm text-gray-500">No nearby assignments right now.</div>
        <div v-else class="grid gap-3">
          <div v-for="group in nearby" :key="group.delivery_id" class="rounded-lg border p-3">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold">Delivery #{{ group.delivery_id }}</div>
              <div class="flex items-center gap-3">
                <div class="text-xs text-gray-500" v-if="group.service || group.price">
                  <span v-if="group.service">{{ group.service }}</span>
                  <span v-if="group.service && group.price"> • </span>
                  <span v-if="group.price">{{ group.price }}</span>
                </div>
                <button
                  v-if="canAssign"
                  class="h-8 px-3 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
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
                <div class="font-medium">{{ group.pickup_location || '—' }}</div>
              </div>
              <div>
                <div class="text-gray-500">Delivery</div>
                <div class="font-medium">{{ group.delivery_location || '—' }}</div>
              </div>
            </div>

            <!-- Packages -->
            <div class="mt-3">
              <div class="text-xs text-gray-500 mb-1">Packages</div>
              <ul class="space-y-2">
                <li v-for="p in group.packages" :key="p.id" class="flex items-center justify-between" :class="{ 'bg-green-50 border border-green-200 rounded': acceptedIds.has(p.id) }">
                  <div class="text-sm">
                    <span class="font-medium">#{{ p.id }}</span>
                    <span v-if="p.description" class="text-gray-500"> — {{ p.description }}</span>
                    <span v-if="acceptedIds.has(p.id)" class="ml-2 inline-flex items-center gap-1 text-green-700 text-xs">
                      <span class="inline-block h-1.5 w-1.5 rounded-full bg-green-600"></span>
                      Accepted
                    </span>
                  </div>
                  <div v-if="canAssign">
                    <template v-if="!acceptedIds.has(p.id)">
                      <button class="h-8 px-3 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" :disabled="assigningId === p.id || acceptingGroupId === group.delivery_id" @click="acceptAssignment(p.id)">
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
            <button class="h-9 px-3 rounded border bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="!manualPackageId || assigningId === manualPackageId" @click="acceptByManualId">Accept by ID</button>
          </div>
        </div>
        <div class="mt-2 pt-3 border-t text-xs text-gray-500" v-else>
          To enable accepting, set VITE_ASSIGN_ENDPOINT to the correct endpoint path.
        </div>
      </div>
    </section>

    <!-- New Pickup Modal (only when allowed based on active deliveries) -->
    <NewPickupRequestModal
      v-if="canShowNewPickup"
      v-model="showNewPickup"
      :request="currentRequest"
      @accept="handleAccept"
      @decline="handleDecline"
      @expired="handleExpired"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, reactive } from 'vue'
import ActiveDeliveriesFromApi from '@/components/ActiveDeliveriesFromApi.vue'
import NewPickupRequestModal from '@/components/NewPickupRequestModal.vue'
import SmallMap from '@/components/SmallMap.vue'
import type { NewPickupRequest } from '@/types/pickups'
import { addNewPickupListener, emitNewPickupRequest } from '@/utils/pickupEvents'
import { useDriverDeliveries } from '@/composables/useDriverDeliveries'
import { assignPackage, getAvailablePackages, type UnassignedPackagesByDelivery } from '@/api/packages'
import { setJobsCount, setNearbyCount } from '@/stores/counters'
import { geocodeAddress } from '@/utils/geocode'

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
  packages: Array<{ id: number; description?: string }>
}
const nearby = ref<NearbyGroup[]>([])
const nearbyLoading = ref(false)
const nearbyError = ref<string | null>(null)
const coords = ref<{ lat?: number; lng?: number }>({})
const manualPackageId = ref<number | null>(null)
const assigningId = ref<number | null>(null)
const acceptingGroupId = ref<number | null>(null)
// Track recently accepted package IDs for visual feedback
const acceptedIds = reactive(new Set<number>())
const nearbyInfo = computed(() => {
  if (coords.value.lat != null && coords.value.lng != null) return `Using location: ${coords.value.lat.toFixed(4)}, ${coords.value.lng.toFixed(4)}`
  return 'Showing suggestions without precise location'
})

// Accept action is only available when an assign endpoint is configured
// Assign endpoint exists per spec (/api/packages/assign_package/)
const canAssign = computed(() => true)

const mapCenter = computed(() => {
  if (coords.value.lat != null && coords.value.lng != null) return { lat: coords.value.lat, lng: coords.value.lng }
  const first = nearby.value.find(n => n.pickup_lat != null && n.pickup_lng != null)
  if (first && first.pickup_lat != null && first.pickup_lng != null) return { lat: first.pickup_lat, lng: first.pickup_lng }
  return { lat: 59.9139, lng: 10.7522 }
})

const mapMarkers = computed(() => {
  const markers: Array<{ lat: number; lng: number; label?: string }> = []
  // Current location marker
  if (coords.value.lat != null && coords.value.lng != null) {
    markers.push({ lat: coords.value.lat, lng: coords.value.lng, label: 'You are here' })
  }
  // Add pickup markers when coordinates are present
  for (const n of nearby.value) {
    if (n.pickup_lat != null && n.pickup_lng != null) {
      markers.push({ lat: n.pickup_lat, lng: n.pickup_lng, label: `Delivery #${n.delivery_id}` })
    }
  }
  return markers
})

async function loadNearby() {
  nearbyLoading.value = true
  nearbyError.value = null
  try {
    const groups = await getAvailablePackages()
    const list: NearbyGroup[] = []
    for (const g of groups as UnassignedPackagesByDelivery[]) {
      const rawLat: any = (g as any).pickup_latitude
      const rawLng: any = (g as any).pickup_longitude
      const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : (typeof rawLat === 'number' ? rawLat : undefined)
      const lng = typeof rawLng === 'string' ? parseFloat(rawLng) : (typeof rawLng === 'number' ? rawLng : undefined)
      list.push({
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
        packages: (g.packages || []).map(p => ({ id: p.id, description: p.description })),
      })
    }
    nearby.value = list
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

function locateAndLoadNearby() {
  if (!('geolocation' in navigator)) {
    nearbyError.value = 'Geolocation not supported by this browser.'
    return
  }
  // Geolocation not used by available_packages; still allow user marker
  nearbyLoading.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      await loadNearby()
    },
    async () => {
      coords.value = {}
      await loadNearby()
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
  )
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

const removeListener = addNewPickupListener((req) => {
  if (!canShowNewPickup.value) return
  currentRequest.value = req
  showNewPickup.value = true
})

onUnmounted(() => removeListener())

// Dev-time demo trigger - only when allowed based on API data
onMounted(async () => {
  await loadFuture()
  // Update jobs count badge (number of current jobs)
  setJobsCount((future.value?.length as number) || 0)
  // Load nearby (without location) initially
  await loadNearby()
  if (import.meta.env.DEV) {
    setTimeout(() => {
      if (!canShowNewPickup.value) return
      emitNewPickupRequest({
        priority: 'standard',
        pickup: { name: 'Kiwi Majorstuen', address: 'Bogstadveien 55, 0366 Oslo' },
        dropoff: { name: 'Sofia Hansen', address: 'Storgata 28, 0184 Oslo' },
        etaMinutes: 11,
        distanceKm: 1.0,
        dimensions: '29 × 20 × 11 cm',
        weightKg: 2.2,
        volumeL: 6.4,
        feeKr: 75,
        expiresInSeconds: 150, // 2:30
      })
    }, 800)
  }
})

async function refreshAll() {
  await Promise.allSettled([loadFuture(), loadNearby()])
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
</script>
