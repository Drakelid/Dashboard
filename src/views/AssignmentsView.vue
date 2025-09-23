<template>
  <section class="space-y-6 pb-12">
    <!-- Header Strip -->
    <header class="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200/60">
      <div class="px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-semibold text-gray-900">Assignments</h1>
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  :class="isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
              <CheckCircle class="w-3.5 h-3.5" />
              {{ isOnline ? 'Online' : 'Offline' }} - {{ nextPickupLabel }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mt-1">Stay on top of pickups, deliveries, and any special actions required.</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="h-9 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm inline-flex items-center gap-2"
            @click="toggleAutoAssign"
          >
            <component :is="autoAssignEnabled ? ToggleRight : ToggleLeft" class="w-4 h-4" />
            <span>{{ autoAssignEnabled ? 'Auto-assignment on' : 'Enable auto-assignment' }}</span>
          </button>
          <button
            class="h-9 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-sm inline-flex items-center gap-2 text-red-700"
            @click="handleSOS"
          >
            <ShieldAlert class="w-4 h-4" />
            <span>SOS / Support</span>
          </button>
          <button
            class="h-9 px-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-sm inline-flex items-center gap-2 text-blue-700"
            @click="handleScan"
          >
            <Scan class="w-4 h-4" />
            <span>Scan label / QR</span>
          </button>
        </div>
      </div>
    </header>

    <section v-if="loadError" class="px-4 md:px-6">
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-3">
        <AlertTriangle class="w-4 h-4 mt-0.5" />
        <div>
          <div class="font-semibold">Assignments are unavailable</div>
          <p class="mt-0.5">
            {{ loadError }}. Showing sample assignments so you can preview the workflow.
          </p>
        </div>
        <button class="ml-auto text-xs text-amber-700 underline" @click="refresh">Retry</button>
      </div>
    </section>

    <!-- Performance Strip -->
    <section class="px-4 md:px-6">
      <div class="grid gap-3 md:grid-cols-4">
        <div v-for="metric in performanceMetrics" :key="metric.label" class="rounded-xl border bg-white px-4 py-3 shadow-sm">
          <div class="text-xs uppercase tracking-wide text-gray-500">{{ metric.label }}</div>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-xl font-semibold text-gray-900">{{ metric.value }}</span>
            <span v-if="metric.delta" class="text-xs" :class="metric.delta > 0 ? 'text-green-600' : 'text-gray-500'">
              {{ metric.delta > 0 ? `+${metric.delta}` : metric.delta }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ metric.caption }}</p>
        </div>
      </div>
    </section>

    <!-- Route Overview Bar -->
    <section class="px-4 md:px-6">
      <div class="rounded-xl border bg-white shadow-sm px-4 py-3 overflow-x-auto">
        <div class="flex items-center gap-3 min-w-max">
          <button
            v-for="stop in routeStops"
            :key="stop.id"
            class="px-3 py-2 rounded-lg border text-sm inline-flex flex-col items-start gap-1 min-w-[160px]"
            :class="selectedAssignmentId === stop.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'"
            @click="selectAssignment(stop.id)"
          >
            <span class="font-medium flex items-center gap-1">
              <MapPin class="w-3.5 h-3.5" />
              {{ stop.label }}
            </span>
            <span class="text-xs text-gray-500 flex items-center gap-2">
              <Clock class="w-3 h-3" /> {{ stop.time }} - {{ stop.distance }}
            </span>
            <div class="w-full h-1 rounded-full bg-gray-200">
              <div class="h-1 rounded-full bg-blue-500" :style="{ width: stop.progress + '%' }"></div>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- Primary Split Pane -->
    <section class="px-4 md:px-6">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <!-- Assignment Groups -->
        <div class="space-y-4">
          <div v-for="group in assignmentGroups" :key="group.id" class="rounded-xl border bg-white shadow-sm">
            <header class="px-4 py-3 border-b flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full" :class="group.dot"></span>
                <h2 class="text-sm font-semibold text-gray-800">{{ group.label }}</h2>
                <span class="text-xs text-gray-500">({{ group.items.length }})</span>
              </div>
            </header>
            <div v-if="!group.items.length" class="px-4 py-6 text-sm text-gray-500">Nothing here right now.</div>
            <div v-else class="divide-y">
              <article
                v-for="assignment in group.items"
                :key="assignment.id"
                class="px-4 py-4 space-y-3 cursor-pointer hover:bg-blue-50/40"
                :class="selectedAssignmentId === assignment.id ? 'bg-blue-50/60' : ''"
                @click="selectAssignment(assignment.id)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Truck class="w-4 h-4" />
                      {{ assignment.pickupLabel }}
                    </div>
                    <div class="text-xs text-gray-500">to {{ assignment.dropoffLabel }}</div>
                    <div class="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span class="inline-flex items-center gap-1"><Clock class="w-3 h-3" /> {{ assignment.timeLabel }}</span>
                      <span>{{ assignment.distanceLabel }}</span>
                      <span class="font-medium text-green-700">{{ assignment.earningsLabel }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-1 text-xs text-gray-500">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="assignment.priorityBadge">{{ assignment.priorityLabel }}</span>
                    <button class="text-xs text-blue-600 hover:underline" @click.stop="openPackageModal(assignment)">View details</button>
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div>
                    <div class="font-medium text-gray-800">Pickup Window</div>
                    <div>{{ assignment.pickupWindow }}</div>
                  </div>
                  <div>
                    <div class="font-medium text-gray-800">Contact</div>
                    <div>{{ assignment.contactName }} · {{ assignment.contactPhone }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="h-8 px-3 text-xs rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center gap-1"
                    @click.stop="callContact(assignment)"
                  >
                    <Phone class="w-3.5 h-3.5" />
                    Call
                  </button>
                  <button
                    class="h-8 px-3 text-xs rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center gap-1"
                    @click.stop="messageContact(assignment)"
                  >
                    <MessageSquare class="w-3.5 h-3.5" />
                    Message
                  </button>
                  <button
                    v-if="!assignment.localPicked"
                    class="h-8 px-3 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-1"
                    @click.stop="markPickedUp(assignment)"
                  >
                    <PackageIcon class="w-3.5 h-3.5" />
                    Picked up
                  </button>
                  <button
                    class="h-8 px-3 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1"
                    @click.stop="navigateTo(assignment)"
                  >
                    <Navigation class="w-3.5 h-3.5" />
                    Navigate
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>

        <!-- Map & Task Drawer -->
        <div class="space-y-4">
          <div class="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <MapIcon class="w-4 h-4" /> Live Route Map
              </div>
              <span class="text-xs text-gray-500">Auto-focused on selected assignment</span>
            </div>
            <SmallMap
              :center="mapCenter"
              :markers="mapMarkers"
              :open-marker-id="selectedAssignmentId"
              height="320px"
            />
          </div>

          <div class="rounded-xl border bg-white shadow-sm overflow-hidden">
            <button class="w-full px-4 py-3 border-b flex items-center justify-between text-sm font-semibold text-gray-800"
                    @click="taskDrawerOpen = !taskDrawerOpen">
              <span class="inline-flex items-center gap-2">
                <ClipboardList class="w-4 h-4" /> Micro Tasks
              </span>
              <span class="text-xs text-gray-500">{{ completedTaskCount }}/{{ taskList.length }} done</span>
            </button>
            <div v-if="taskDrawerOpen" class="max-h-64 overflow-y-auto divide-y">
              <div
                v-for="task in taskList"
                :key="task.id"
                class="px-4 py-3 flex items-center justify-between gap-3 text-sm"
              >
                <div class="flex flex-col">
                  <span class="font-medium text-gray-800">{{ task.label }}</span>
                  <span class="text-xs text-gray-500">{{ task.assignmentLabel }} · {{ task.dueLabel }}</span>
                </div>
                <button
                  class="h-7 w-7 rounded-full border flex items-center justify-center"
                  :class="task.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white hover:bg-gray-50 text-gray-600'"
                  @click="toggleTask(task.assignmentId, task.id)"
                >
                  <Check class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-xl border bg-white shadow-sm">
            <header class="px-4 py-3 border-b flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Timeline & Activity</span>
              <select v-model="timelineFilter" class="h-8 px-2 text-xs border rounded">
                <option value="all">All</option>
                <option value="ready">Ready for pickup</option>
                <option value="in_transit">In transit</option>
                <option value="needs_action">Needs action</option>
              </select>
            </header>
            <ol class="px-4 py-3 space-y-3 text-sm">
              <li v-for="event in filteredTimeline" :key="event.id" class="flex gap-3">
                <div class="mt-1">
                  <span class="h-2.5 w-2.5 rounded-full inline-block" :class="event.color"></span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ event.title }}</div>
                  <div class="text-xs text-gray-500">{{ event.timestamp }} · {{ event.assignmentLabel }}</div>
                  <p class="text-xs text-gray-600 mt-1">{{ event.description }}</p>
                </div>
              </li>
              <li v-if="!filteredTimeline.length" class="text-xs text-gray-500">No events for this filter.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <AssignmentPackageModal
      :open="packageModalOpen"
      :packages="selectedAssignment?.packages || []"
      :assignment-id="selectedAssignment?.id"
      @close="packageModalOpen = false"
      @scan="handleScan"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDriverDeliveries } from '@/composables/useDriverDeliveries'
import SmallMap from '@/components/SmallMap.vue'
import AssignmentPackageModal from '@/components/AssignmentPackageModal.vue'
import { toast } from '@/utils/toast'
import { geocodeAddress } from '@/utils/geocode'
import type { DriverDeliveryItem, Package } from '@/types/api'
import {
  Check,
  CheckCircle,
  ClipboardList,
  Clock,
  AlertTriangle,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  Navigation,
  Package as PackageIcon,
  Phone,
  Scan,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  Truck
} from 'lucide-vue-next'

const { future, loading: deliveriesLoading, error: deliveriesError, loadFuture, refresh } = useDriverDeliveries()
const router = useRouter()
const route = useRoute()

const isOnline = ref(true)
const autoAssignEnabled = ref(true)
const taskDrawerOpen = ref(true)
const timelineFilter = ref<'all' | 'ready' | 'in_transit' | 'needs_action'>('all')
const selectedAssignmentId = ref<string | null>(route.query.focus as string || null)
const packageModalOpen = ref(false)
const pickedUpState = reactive<Record<string, boolean>>({})
const assignmentCoords = reactive<Record<string, { lat: number; lng: number }>>({})

onMounted(() => {
  if (!future.value) {
    loadFuture().catch(() => {})
  }
})

watch(
  () => route.query.focus,
  value => {
    if (typeof value === 'string') selectAssignment(value)
  }
)

const loadError = computed(() => deliveriesError.value || null)

const fallbackDeliveries = createFallbackDeliveries()
const displayAssignments = ref<DriverDeliveryItem[]>(fallbackDeliveries)

watch(
  () => future.value,
  value => {
    if (value && value.length) {
      displayAssignments.value = value
    }
  },
  { immediate: true }
)

watch(loadError, err => {
  if (err && (!future.value || !future.value.length)) {
    displayAssignments.value = fallbackDeliveries
  }
})

const enrichedAssignments = computed(() =>
  displayAssignments.value.map((entry, index) => enrichAssignment(entry, index))
)

watch(
  enrichedAssignments,
  value => {
    if (!value.length) {
      selectedAssignmentId.value = null
      return
    }
    if (!selectedAssignmentId.value) {
      selectedAssignmentId.value = value[0].id
    } else if (!value.some(item => item.id === selectedAssignmentId.value)) {
      selectedAssignmentId.value = value[0].id
    }
  },
  { immediate: true }
)

const selectedAssignment = computed(() =>
  enrichedAssignments.value.find(item => item.id === selectedAssignmentId.value) || null
)

const assignmentGroups = computed(() => {
  const groups = [
    { id: 'ready', label: 'Ready for pickup', dot: 'bg-blue-500', items: [] as AssignmentExtended[] },
    { id: 'in_transit', label: 'In transit', dot: 'bg-amber-500', items: [] as AssignmentExtended[] },
    { id: 'needs_action', label: 'Needs attention', dot: 'bg-red-500', items: [] as AssignmentExtended[] },
  ]
  for (const assignment of enrichedAssignments.value) {
    const group = groups.find(g => g.id === assignment.status)
    if (group) group.items.push(assignment)
  }
  return groups
})

const routeStops = computed(() =>
  enrichedAssignments.value.map((assignment, idx, arr) => ({
    id: assignment.id,
    label: assignment.dropoffLabel,
    time: assignment.timeLabel,
    distance: assignment.distanceLabel,
    progress: arr.length <= 1 ? 100 : Math.round((idx / (arr.length - 1)) * 100),
  }))
)

const mapMarkers = computed(() =>
  enrichedAssignments.value.map(assignment => ({
    id: assignment.id,
    lat: assignment.coordinates.lat,
    lng: assignment.coordinates.lng,
    label: `${assignment.dropoffLabel}\n${assignment.timeLabel}`,
    kind: assignment.status === 'needs_action' ? 'nearby' : 'job',
    color: assignment.status === 'needs_action' ? '#f97316' : assignment.status === 'in_transit' ? '#2563eb' : '#16a34a',
  }))
)

const mapCenter = computed(() => {
  const selected = mapMarkers.value.find(marker => marker.id === selectedAssignmentId.value)
  if (selected) return { lat: selected.lat, lng: selected.lng }
  return mapMarkers.value[0] ? { lat: mapMarkers.value[0].lat, lng: mapMarkers.value[0].lng } : { lat: 59.9139, lng: 10.7522 }
})

const nextPickupLabel = computed(() => {
  const upcoming = enrichedAssignments.value[0]
  if (!upcoming) return 'No assignments queued'
  return upcoming.timeLabel
})

const taskState = reactive(new Map<string, Record<string, boolean>>())

const taskList = computed(() => {
  const list: DrawerTask[] = []
  for (const assignment of enrichedAssignments.value) {
    for (const task of assignment.tasks) {
      if (!taskState.get(assignment.id)) {
        taskState.set(assignment.id, {})
      }
      const completed = taskState.get(assignment.id)![task.id] || false
      list.push({
        id: task.id,
        label: task.label,
        dueLabel: task.dueLabel,
        assignmentId: assignment.id,
        assignmentLabel: assignment.dropoffLabel,
        completed,
      })
    }
  }
  return list
})

const completedTaskCount = computed(() => taskList.value.filter(task => task.completed).length)

const timelineEvents = computed(() => {
  const events: TimelineEvent[] = []
  for (const assignment of enrichedAssignments.value) {
    events.push(...assignment.timeline)
  }
  return events.sort((a, b) => a.sortOrder - b.sortOrder)
})

const filteredTimeline = computed(() => {
  if (timelineFilter.value === 'all') return timelineEvents.value
  return timelineEvents.value.filter(event => event.status === timelineFilter.value)
})

const performanceMetrics = computed(() => {
  const assignments = enrichedAssignments.value
  const total = assignments.length
  const readyCount = assignments.filter(item => item.status === 'ready').length
  const inTransit = assignments.filter(item => item.status === 'in_transit').length
  const earnings = assignments.reduce((sum, item) => sum + (item.earningsValue || 0), 0)
  const ecoCount = assignments.reduce((sum, item) => sum + item.ecoPackages, 0)

  return [
    { label: 'Assignments queued', value: total, delta: readyCount, caption: `${readyCount} ready for pickup` },
    { label: 'In transit', value: inTransit, delta: 0, caption: 'Deliveries currently on the road' },
    { label: 'Earnings today', value: formatCurrency(earnings), delta: assignments.filter(item => item.completed).length, caption: 'Including bonuses' },
    { label: 'Eco packages', value: ecoCount, delta: 0, caption: 'Packages marked eco-friendly' },
  ]
})

function selectAssignment(id: string) {
  selectedAssignmentId.value = id
  router.replace({ query: { ...route.query, focus: id } })
}

function toggleAutoAssign() {
  autoAssignEnabled.value = !autoAssignEnabled.value
  toast.info(autoAssignEnabled.value ? 'Auto-assignment enabled' : 'Auto-assignment disabled')
}

function handleSOS() {
  toast.error('Support has been notified. Stay safe!')
}

function handleScan() {
  toast.success('Opening scanner…')
}

function callContact(assignment: AssignmentExtended) {
  toast.info(`Dialing ${assignment.contactPhone}`)
}

function messageContact(assignment: AssignmentExtended) {
  toast.info(`Starting chat with ${assignment.contactName}`)
}

function markPickedUp(assignment: AssignmentExtended) {
  pickedUpState[assignment.id] = true
  toast.success(`Marked assignment #${assignment.id} as picked up`)
}

function navigateTo(assignment: AssignmentExtended) {
  toast.info(`Starting navigation to ${assignment.dropoffLabel}`)
}

function openPackageModal(assignment: AssignmentExtended) {
  selectAssignment(assignment.id)
  packageModalOpen.value = true
}

function toggleTask(assignmentId: string, taskId: string) {
  const entry = taskState.get(assignmentId) || {}
  entry[taskId] = !entry[taskId]
  taskState.set(assignmentId, entry)
}

function formatCurrency(value: number) {
  if (!value) return 'kr 0'
  return `kr ${Math.round(value).toLocaleString()}`
}

function enrichAssignment(entry: DriverDeliveryItem, index: number): AssignmentExtended {
  const id = String(entry.delivery?.id ?? entry.delivery?.uuid ?? `assignment-${index + 1}`)
  const status = deriveStatus(entry)
  const priority = derivePriority(entry)
  const packages = entry.packages || []
  const ecoPackages = packages.filter(pkg => !pkg.hazardous).length
  const earningsValue = deriveEarnings(entry)
  const pickupWindow = formatPickupWindow(entry)
  const coordinates = resolveCoordinates(id, entry, index)
  const tasks = createMicroTasks(id, status)
  const timeline = createTimelineEntries(id, entry, status)
  const localPicked = !!pickedUpState[id]
  const effectiveStatus = localPicked && status === 'ready' ? 'in_transit' : status

  return {
    id,
    original: entry,
    status: effectiveStatus,
    priority,
    priorityBadge: priority === 'urgent' ? 'bg-red-100 text-red-700' : priority === 'express' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700',
    priorityLabel: priority === 'standard' ? 'Standard' : priority === 'express' ? 'Express' : 'Urgent',
    pickupLabel: entry.pickup_location || entry.delivery?.pickup_location || 'Pickup TBD',
    dropoffLabel: entry.delivery?.delivery_location || entry.location || 'Destination TBD',
    packages,
    ecoPackages,
    earningsValue,
    earningsLabel: earningsValue ? formatCurrency(earningsValue) : 'kr 0',
    timeLabel: formatTime(entry) || 'Time TBD',
    distanceLabel: formatDistance(entry) || 'Distance TBD',
    pickupWindow,
    contactName: entry.delivery?.receiver?.name || entry.actor?.name || 'Recipient',
    contactPhone: entry.delivery?.receiver?.phone || entry.actor?.phone || 'N/A',
    coordinates,
    tasks,
    timeline,
    completed: packages.every(pkg => (pkg.delivery_status || '').toLowerCase().includes('delivered')),
    localPicked,
  }
}

function deriveStatus(entry: DriverDeliveryItem): AssignmentStatus {
  const statuses = (entry.packages || []).map(pkg => (pkg.delivery_status || '').toLowerCase())
  if (statuses.some(status => status.includes('delayed') || status.includes('exception'))) return 'needs_action'
  if (statuses.some(status => status.includes('picked') || status.includes('transit'))) return 'in_transit'
  return 'ready'
}

function derivePriority(entry: DriverDeliveryItem): TaskPriority {
  const service = (entry.delivery?.service || '').toLowerCase()
  if (service.includes('express') || service.includes('same day')) return 'express'
  if ((entry.packages || []).some(pkg => pkg.fragile || pkg.hazardous)) return 'urgent'
  return 'standard'
}

function deriveEarnings(entry: DriverDeliveryItem) {
  const delivery = entry.delivery as any
  const candidates = [delivery?.fee, delivery?.price, delivery?.total_price, delivery?.delivery_fee]
  for (const value of candidates) {
    if (value == null) continue
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    if (Number.isFinite(num)) return num
  }
  return 0
}

function formatTime(entry: DriverDeliveryItem) {
  const time = entry.pickup_time || entry.delivery?.pickup_time || entry.delivery?.delivery_time
  if (!time) return null
  return time.slice(0, 5)
}

function formatDistance(entry: DriverDeliveryItem) {
  const distance = (entry as any)?.distance_km || (entry as any)?.distance
  if (!distance) return null
  const num = typeof distance === 'number' ? distance : parseFloat(String(distance))
  if (!Number.isFinite(num)) return null
  return `${num.toFixed(1)} km`
}

function formatPickupWindow(entry: DriverDeliveryItem) {
  const date = entry.pickup_date || entry.delivery?.pickup_date
  const time = entry.pickup_time || entry.delivery?.pickup_time
  if (!date && !time) return 'Window pending'
  if (!date) return `At ${time?.slice(0, 5)}`
  const formatted = new Date(`${date}T${time || '00:00:00'}`)
  if (Number.isNaN(formatted.getTime())) return `${date} ${time || ''}`.trim()
  return `${formatted.toLocaleDateString()} - ${formatted.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

const pendingGeocodes = new Set<string>()

function resolveCoordinates(id: string, entry: DriverDeliveryItem, index: number) {
  const stored = assignmentCoords[id]
  if (stored) return stored

  const direct = extractCoordinates(entry)
  if (direct) {
    assignmentCoords[id] = direct
    return direct
  }

  if (!pendingGeocodes.has(id)) {
    pendingGeocodes.add(id)
    geocodeAssignment(id, entry).finally(() => pendingGeocodes.delete(id))
  }

  return fallbackCoordinate(index)
}

function extractCoordinates(entry: DriverDeliveryItem) {
  const candidates: Array<{ lat?: any; lng?: any }> = []
  const e: any = entry
  const d: any = entry.delivery || {}

  candidates.push({ lat: e.delivery_latitude, lng: e.delivery_longitude })
  candidates.push({ lat: e.pickup_latitude, lng: e.pickup_longitude })
  candidates.push({ lat: d.delivery_latitude, lng: d.delivery_longitude })
  candidates.push({ lat: d.pickup_latitude, lng: d.pickup_longitude })
  candidates.push({ lat: e.latitude, lng: e.longitude })

  for (const pair of candidates) {
    const lat = toNumber(pair.lat)
    const lng = toNumber(pair.lng)
    if (lat != null && lng != null) return { lat, lng }
  }
  return null
}

async function geocodeAssignment(id: string, entry: DriverDeliveryItem) {
  const address = entry.delivery?.delivery_location || entry.location || entry.pickup_location
  if (!address) return
  const result = await geocodeAddress(address)
  if (result) assignmentCoords[id] = result
}

function fallbackCoordinate(index: number) {
  const baseLat = 59.9139
  const baseLng = 10.7522
  const offset = index * 0.003
  return { lat: baseLat + offset, lng: baseLng + offset }
}

function toNumber(value: any): number | null {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const parsed = parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function createMicroTasks(assignmentId: string, status: AssignmentStatus): DrawerTaskInternal[] {
  const tasks: DrawerTaskInternal[] = [
    { id: `${assignmentId}-verify-id`, label: 'Verify recipient ID', dueLabel: 'Before delivery' },
    { id: `${assignmentId}-collect-signature`, label: 'Collect signature', dueLabel: 'At drop-off' },
    { id: `${assignmentId}-photo-proof`, label: 'Photo proof of delivery', dueLabel: 'After drop-off' },
  ]
  if (status === 'ready') {
    tasks.unshift({ id: `${assignmentId}-inspect-package`, label: 'Inspect package condition', dueLabel: 'At pickup' })
  }
  return tasks
}

function createTimelineEntries(id: string, entry: DriverDeliveryItem, status: AssignmentStatus): TimelineEvent[] {
  const baseTime = new Date()
  return [
    {
      id: `${id}-created`,
      title: 'Assignment created',
      description: `New assignment scheduled for ${entry.delivery?.delivery_location || 'destination'}.`,
      timestamp: baseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status,
      color: 'bg-blue-500',
      assignmentLabel: entry.delivery?.delivery_location || entry.location || id,
      sortOrder: baseTime.getTime() - 300000,
    },
    {
      id: `${id}-reminder`,
      title: status === 'ready' ? 'Pickup window approaching' : 'Keep driving',
      description: status === 'ready' ? 'Head to pickup location within the next 15 minutes.' : 'Continue to destination, traffic looks clear ahead.',
      timestamp: new Date(baseTime.getTime() + 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status,
      color: status === 'needs_action' ? 'bg-red-500' : status === 'in_transit' ? 'bg-amber-500' : 'bg-blue-500',
      assignmentLabel: entry.delivery?.delivery_location || entry.location || id,
      sortOrder: baseTime.getTime() + 600000,
    },
  ]
}

function createFallbackDeliveries(): DriverDeliveryItem[] {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  return [
    {
      type: 'delivery',
      delivery: {
        id: 5012,
        pickup_location: 'SamBring Logistics Hub',
        delivery_location: 'Fjordgata 12, Oslo',
        receiver: { name: 'Alex Johnson', phone: '+47 998 88 776' },
        service: 'standard',
        pickup_date: today,
        pickup_time: '09:30:00',
        delivery_date: today,
        delivery_time: '10:15:00',
        pickup_latitude: 59.9096,
        pickup_longitude: 10.7449,
        delivery_latitude: 59.9187,
        delivery_longitude: 10.7523,
      },
      packages: [
        {
          id: 9101,
          description: 'Organic produce crate',
          weight: 4.5,
          weight_unit: 'kg',
          length: 40,
          width: 35,
          height: 25,
          dimension_unit: 'cm',
          hazardous: false,
          fragile: true,
          delivery_status: 'ready_for_pickup',
        },
      ],
      location: 'Fjordgata 12, Oslo',
      date: today,
      time: '10:15:00',
      pickup_location: 'SamBring Logistics Hub',
      pickup_date: today,
      pickup_time: '09:30:00',
      pickup_latitude: 59.9096,
      pickup_longitude: 10.7449,
      delivery_latitude: 59.9187,
      delivery_longitude: 10.7523,
      actor: { name: 'Alex Johnson', phone: '+47 998 88 776' },
      actor_type: 'receiver',
      is_delivered: false,
    },
    {
      type: 'delivery',
      delivery: {
        id: 5013,
        pickup_location: 'Eco Market Warehouse',
        delivery_location: 'Nordveien 22, Oslo',
        receiver: { name: 'Maria Berg', phone: '+47 990 11 223' },
        service: 'express',
        pickup_date: today,
        pickup_time: '11:00:00',
        delivery_date: today,
        delivery_time: '11:30:00',
        pickup_latitude: 59.921,
        pickup_longitude: 10.761,
        delivery_latitude: 59.9265,
        delivery_longitude: 10.7531,
      },
      packages: [
        {
          id: 9102,
          description: 'Medical supplies',
          weight: 2.1,
          weight_unit: 'kg',
          length: 30,
          width: 25,
          height: 20,
          dimension_unit: 'cm',
          hazardous: false,
          fragile: false,
          delivery_status: 'picked_up',
        },
      ],
      location: 'Nordveien 22, Oslo',
      date: today,
      time: '11:30:00',
      pickup_location: 'Eco Market Warehouse',
      pickup_date: today,
      pickup_time: '11:00:00',
      pickup_latitude: 59.921,
      pickup_longitude: 10.761,
      delivery_latitude: 59.9265,
      delivery_longitude: 10.7531,
      actor: { name: 'Maria Berg', phone: '+47 990 11 223' },
      actor_type: 'receiver',
      is_delivered: false,
    },
    {
      type: 'delivery',
      delivery: {
        id: 5014,
        pickup_location: 'Downtown Electronics',
        delivery_location: 'Storgata 84, Oslo',
        receiver: { name: 'Leif Andersen', phone: '+47 955 44 332' },
        service: 'same day',
        pickup_date: today,
        pickup_time: '13:15:00',
        delivery_date: today,
        delivery_time: '14:00:00',
        pickup_latitude: 59.9175,
        pickup_longitude: 10.733,
        delivery_latitude: 59.9121,
        delivery_longitude: 10.7608,
      },
      packages: [
        {
          id: 9103,
          description: 'Refurbished laptop',
          weight: 1.7,
          weight_unit: 'kg',
          length: 35,
          width: 25,
          height: 5,
          dimension_unit: 'cm',
          hazardous: false,
          fragile: true,
          delivery_status: 'in_transit',
        },
      ],
      location: 'Storgata 84, Oslo',
      date: today,
      time: '14:00:00',
      pickup_location: 'Downtown Electronics',
      pickup_date: today,
      pickup_time: '13:15:00',
      pickup_latitude: 59.9175,
      pickup_longitude: 10.733,
      delivery_latitude: 59.9121,
      delivery_longitude: 10.7608,
      actor: { name: 'Leif Andersen', phone: '+47 955 44 332' },
      actor_type: 'receiver',
      is_delivered: false,
    },
  ]
}

interface AssignmentExtended {
  id: string
  original: DriverDeliveryItem
  status: AssignmentStatus
  priority: TaskPriority
  priorityBadge: string
  priorityLabel: string
  pickupLabel: string
  dropoffLabel: string
  packages: Package[]
  ecoPackages: number
  earningsValue: number
  earningsLabel: string
  timeLabel: string
  distanceLabel: string
  pickupWindow: string
  contactName: string
  contactPhone: string
  coordinates: { lat: number; lng: number }
  tasks: DrawerTaskInternal[]
  timeline: TimelineEvent[]
  completed: boolean
}

type AssignmentStatus = 'ready' | 'in_transit' | 'needs_action'

type DrawerTaskInternal = { id: string; label: string; dueLabel: string }

type DrawerTask = DrawerTaskInternal & {
  assignmentId: string
  assignmentLabel: string
  completed: boolean
}

type TimelineEvent = {
  id: string
  title: string
  description: string
  timestamp: string
  status: AssignmentStatus
  color: string
  assignmentLabel: string
  sortOrder: number
}

type TaskPriority = 'urgent' | 'express' | 'standard'
</script>
