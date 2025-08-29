<template>
  <section class="rounded-xl border bg-white shadow-sm">
    <header class="p-4 border-b flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Route Tracker</h3>
        <p class="text-sm text-gray-500">
          {{ stopsRemaining }} stops • {{ totalDistance.toFixed(1) }} km • ~{{ routeTimeMin }} min
        </p>
      </div>
      <div class="flex gap-2">
        <button class="h-9 px-3 rounded border bg-white hover:bg-gray-50" @click="optimizeRoute">Optimize</button>
        <button class="h-9 px-3 rounded bg-green-600 text-white hover:bg-green-700" @click="startRoute">Start</button>
      </div>
    </header>

    <div class="p-4 space-y-3 max-h-96 overflow-auto">
      <div
        v-for="(stop, index) in stops"
        :key="stop.id"
        class="rounded-lg border p-3"
        :class="stop.completed ? 'opacity-70 bg-gray-50' : 'bg-white'"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <div
              class="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold"
              :class="stop.type === 'pickup' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
            >
              {{ index + 1 }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ stop.type === 'pickup' ? 'Pickup' : 'Delivery' }}</span>
                <span
                  class="px-2 py-0.5 rounded text-xs"
                  :class="stop.type === 'pickup' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'"
                >
                  {{ stop.location }}
                </span>
              </div>
              <div class="text-xs text-gray-500">{{ stop.address }}</div>
              <div class="text-xs mt-1">
                <span class="text-gray-500">{{ stop.distanceKm }} km</span>
                <span class="mx-2">•</span>
                <span class="text-gray-500">{{ stop.durationMin }} min</span>
                <span v-if="!stop.completed" class="mx-2">•</span>
                <span v-if="!stop.completed" class="text-gray-700">ETA +{{ cumulativeEta(index) }} min</span>
                <span v-else class="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">Done</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="h-8 w-8 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 grid place-items-center"
              :disabled="index === 0"
              @click="moveUp(index)"
              aria-label="Move up"
            >
              <ChevronUp class="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              class="h-8 w-8 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 grid place-items-center"
              :disabled="index === stops.length - 1"
              @click="moveDown(index)"
              aria-label="Move down"
            >
              <ChevronDown class="w-4 h-4" aria-hidden="true" />
            </button>
            <button class="h-8 w-8 rounded border bg-white hover:bg-gray-50 grid place-items-center" @click="toggleDone(index)" aria-label="Mark done">
              <Check class="w-4 h-4" aria-hidden="true" />
            </button>
            <button class="h-8 w-8 rounded border bg-white hover:bg-red-50 text-red-600 grid place-items-center" @click="removeStop(index)" aria-label="Remove">
              <X class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div v-if="stops.length === 0" class="p-6 text-center text-gray-500">No stops. Add from the map or assignments.</div>
    </div>

    <footer class="p-4 border-t flex items-center justify-between text-sm">
      <div class="text-gray-600">Standard fee: <span class="font-medium text-green-700">75 kr</span></div>
      <div class="flex gap-2">
        <button class="h-8 px-3 rounded border bg-white hover:bg-gray-50" @click="resetRoute">Reset</button>
      </div>
    </footer>
  </section>
</template>
<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ChevronUp, ChevronDown, Check, X } from 'lucide-vue-next'

type StopType = 'pickup' | 'delivery'
type Stop = {
  id: string
  type: StopType
  location: string
  address: string
  distanceKm: number
  durationMin: number
  completed: boolean
}

const stops = reactive<Stop[]>([
  { id: 'S1', type: 'pickup', location: 'Eco-Mart Warehouse', address: '1234 Green Avenue', distanceKm: 1.2, durationMin: 5, completed: false },
  { id: 'S2', type: 'delivery', location: '321 Oak Drive', address: 'Riverside', distanceKm: 3.6, durationMin: 9, completed: false },
  { id: 'S3', type: 'delivery', location: '555 Maple Street', address: 'Downtown', distanceKm: 2.4, durationMin: 7, completed: false },
])

const totalDistance = computed(() => stops.reduce((s, x) => s + x.distanceKm, 0))
const routeTimeMin = computed(() => stops.reduce((s, x) => s + x.durationMin, 0))
const stopsRemaining = computed(() => stops.filter(s => !s.completed).length)

function moveUp(i: number) {
  if (i <= 0) return
  const tmp = stops[i - 1]
  stops[i - 1] = stops[i]
  stops[i] = tmp
}

function moveDown(i: number) {
  if (i >= stops.length - 1) return
  const tmp = stops[i + 1]
  stops[i + 1] = stops[i]
  stops[i] = tmp
}

function toggleDone(i: number) {
  stops[i].completed = !stops[i].completed
}

function removeStop(i: number) {
  stops.splice(i, 1)
}

function optimizeRoute() {
  // Naive: pickups first, then deliveries, then by shortest duration
  stops.sort((a, b) => (a.type === b.type ? a.durationMin - b.durationMin : a.type === 'pickup' ? -1 : 1))
}

function startRoute() {
  // Placeholder: could integrate with map to start navigation
  if (stops.length) stops[0].completed = false
}

function resetRoute() {
  stops.splice(
    0,
    stops.length,
    { id: 'S1', type: 'pickup', location: 'Eco-Mart Warehouse', address: '1234 Green Avenue', distanceKm: 1.2, durationMin: 5, completed: false },
    { id: 'S2', type: 'delivery', location: '321 Oak Drive', address: 'Riverside', distanceKm: 3.6, durationMin: 9, completed: false },
    { id: 'S3', type: 'delivery', location: '555 Maple Street', address: 'Downtown', distanceKm: 2.4, durationMin: 7, completed: false },
  )
}

function cumulativeEta(index: number) {
  let sum = 0
  for (let i = 0; i <= index; i++) sum += stops[i].durationMin
  return sum
}
</script>
