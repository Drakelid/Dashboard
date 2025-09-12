<template>
  <teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[2147483647]">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 z-[2147483646]" @click="onClose" />

      <!-- Modal -->
      <div class="absolute inset-0 flex items-center justify-center p-4 z-[2147483647]">
        <section class="w-[380px] max-w-full rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden z-[2147483647]">
          <!-- Header -->
          <header class="relative px-4 pt-4 pb-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-blue-500" />
                <h3 class="text-base font-semibold">New Pickup Request</h3>
              </div>

              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                  <span class="h-1 w-1 rounded-full bg-orange-500" />
                  standard
                </span>
                <button class="h-5 w-5 grid place-items-center rounded hover:bg-gray-50" aria-label="Close" @click="onClose">
                  <X class="w-3 h-3" />
                </button>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">A new delivery opportunity is available in your area</p>
            <div v-if="deliveryId != null" class="mt-1 text-xs text-gray-700">
              Delivery <span class="font-semibold">#{{ deliveryId }}</span>
            </div>
          </header>

          <!-- Body -->
          <div class="px-4 pb-4 space-y-4">
            <!-- Pickup / Dropoff -->
            <div class="grid grid-cols-2 gap-4 relative">
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5 text-blue-600 font-medium text-xs">
                  <Truck class="w-3.5 h-3.5" />
                  <span>Pickup from:</span>
                </div>
                <div class="font-semibold text-sm">{{ request.pickup.name }}</div>
                <div class="text-xs text-gray-500">{{ request.pickup.address }}</div>
              </div>

              <div class="space-y-0.5 text-right">
                <div class="flex items-center justify-end gap-1.5 text-green-600 font-medium text-xs">
                  <span>Deliver to:</span>
                  <Home class="w-3.5 h-3.5" />
                </div>
                <div class="font-semibold text-sm">{{ request.dropoff.name }}</div>
                <div class="text-xs text-gray-500">{{ request.dropoff.address }}</div>
              </div>

              <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300">
                <ArrowRight class="w-3.5 h-3.5" />
              </div>
            </div>

            <!-- Metrics -->
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ request.etaMinutes }} min</div>
                <div class="text-xs text-gray-500">Estimated Time</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ request.distanceKm.toFixed(1) }} km</div>
                <div class="text-xs text-gray-500">Distance</div>
              </div>
            </div>

            <!-- Package Details (real packages if provided, else fallback preview) -->
            <div v-if="packages && packages.length" class="border rounded-lg p-3 bg-gray-50">
              <div class="font-semibold text-sm mb-2">Packages ({{ packages.length }})</div>
              <ul class="space-y-2">
                <li v-for="p in packages" :key="p.id" class="text-xs grid md:grid-cols-[1fr,auto] items-start gap-2">
                  <div>
                    <div class="font-medium text-gray-800">#{{ p.id }}<span v-if="p.description" class="text-gray-500"> — {{ p.description }}</span></div>
                    <div class="mt-1 flex flex-wrap gap-2">
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
                        <span>{{ p.delivery_status }}</span>
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div v-else class="border rounded-lg p-3 grid grid-cols-[1fr,90px] gap-4 items-center bg-gray-50">
              <div class="space-y-0.5">
                <div class="font-semibold text-sm">Package Details</div>
                <div class="text-xs text-gray-600">{{ request.dimensions }}</div>
                <div class="text-xs flex items-center gap-1">
                  <span class="inline-flex items-center gap-1 text-orange-700">
                    <span class="h-1 w-1 rounded-full bg-orange-600"></span>
                    {{ request.weightKg.toFixed(1) }}kg
                  </span>
                  <span class="text-gray-500">Volume {{ request.volumeL.toFixed(0) }}L</span>
                </div>
              </div>
              <!-- 3D package illustration -->
              <div class="h-16 w-full rounded-md relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200">
                <IsometricPackageBox
                  class="w-full h-full"
                  :dimensions="dimsForPreview"
                  :show-dimensions="false"
                  size="small"
                />
              </div>
            </div>

            <!-- Expires -->
            <div class="text-center">
              <div class="flex items-center justify-center gap-1.5 text-red-600">
                <AlarmClock class="w-3.5 h-3.5" />
                <span class="font-semibold text-sm">Expires in {{ formattedRemaining }}</span>
              </div>
            </div>

            <!-- Fee -->
            <div class="rounded-lg bg-green-50 px-3 py-3 text-center border border-green-100">
              <div class="text-2xl font-bold text-green-700">{{ request.feeKr }} kr</div>
              <div class="text-xs text-green-600">delivery fee</div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="px-4 pb-4 pt-2 flex items-center gap-2">
            <button class="h-10 px-4 rounded-lg border bg-white hover:bg-gray-50 flex-1 flex items-center justify-center gap-1.5 font-medium text-gray-700" @click="onDecline">
              <X class="w-3.5 h-3.5" />
              <span>Decline</span>
            </button>
            <button v-if="deliveryId != null && (packages?.length || 0) > 0" class="h-10 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 flex-1 disabled:opacity-60 flex items-center justify-center gap-1.5 font-medium" :disabled="expired" @click="onAcceptAll">
              <Check class="w-3.5 h-3.5" />
              <span>Accept all</span>
            </button>
            <button class="h-10 px-4 rounded-lg border bg-white text-gray-800 hover:bg-gray-50 flex-1 disabled:opacity-60 flex items-center justify-center gap-1.5 font-medium" :disabled="expired" @click="onAccept">
              <Check class="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>
          </footer>
        </section>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { X, Home, ArrowRight, Check, AlarmClock, Truck } from 'lucide-vue-next'
import IsometricPackageBox from './IsometricPackageBox.vue'
import type { NewPickupRequest } from '@/types/pickups'

const props = defineProps<{
  modelValue: boolean
  request: NewPickupRequest
  deliveryId?: number
  packages?: Array<{
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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'accept', request: NewPickupRequest): void
  (e: 'decline', request: NewPickupRequest): void
  (e: 'expired', request: NewPickupRequest): void
  (e: 'accept-all', deliveryId: number): void
  (e: 'close'): void
}>()

const remaining = ref(0)
const expired = computed(() => remaining.value <= 0)

const formattedRemaining = computed(() => {
  const s = Math.max(0, remaining.value)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
})

const progressPercent = computed(() => {
  const total = props.request.expiresInSeconds || 1
  const r = Math.max(0, remaining.value)
  return Math.min(100, Math.max(0, (r / total) * 100))
})

let timer: number | undefined

function startTimer(seconds: number) {
  remaining.value = seconds
  stopTimer()
  timer = window.setInterval(() => {
    remaining.value -= 1
    if (remaining.value <= 0) {
      stopTimer()
      emit('expired', props.request)
    }
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      startTimer(props.request.expiresInSeconds)
      try { document.documentElement.classList.add('modal-open') } catch {}
    } else {
      stopTimer()
      try { document.documentElement.classList.remove('modal-open') } catch {}
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  stopTimer()
  try { document.documentElement.classList.remove('modal-open') } catch {}
})

function onClose() {
  emit('update:modelValue', false)
  emit('close')
}
function onAccept() {
  emit('accept', props.request)
  emit('update:modelValue', false)
}
function onDecline() {
  emit('decline', props.request)
  emit('update:modelValue', false)
}

function onAcceptAll() {
  if (props.deliveryId != null) {
    emit('accept-all', props.deliveryId)
    emit('update:modelValue', false)
  }
}

const priorityBadge = computed(() => {
  switch (props.request.priority) {
    case 'urgent':
      return 'bg-red-50 text-red-700 border border-red-100'
    case 'express':
      return 'bg-orange-50 text-orange-700 border border-orange-100'
    default:
      return 'bg-blue-50 text-blue-700 border border-blue-100'
  }
})

const priorityDot = computed(() => {
  switch (props.request.priority) {
    case 'urgent':
      return 'bg-red-500'
    case 'express':
      return 'bg-orange-500'
    default:
      return 'bg-blue-500'
  }
})

// Parse package dimensions from string according to spec: L × W × H
// Supports separators x or ×, optional spaces, decimals (comma or dot), and per-dimension units (cm, mm, m, in/inch/inches)
const parsedDimensions = computed(() => {
  const raw = String(props.request.dimensions || '20x15x10 cm').trim()
  // Normalize decimal commas to dots for parsing
  const dimensionStr = raw.replace(/,(?=\d)/g, '.')
  const re = /(\d+(?:\.\d+)?)\s*(cm|mm|m|in|inch|inches)?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|mm|m|in|inch|inches)?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|mm|m|in|inch|inches)?/i
  const match = dimensionStr.match(re)
  if (match) {
    const v1 = parseFloat(match[1])
    const u1 = (match[2] || '').toLowerCase()
    const v2 = parseFloat(match[3])
    const u2 = (match[4] || '').toLowerCase()
    const v3 = parseFloat(match[5])
    const u3 = (match[6] || '').toLowerCase()

    const toCm = (v: number, u: string) => {
      switch (u) {
        case 'mm': return v / 10
        case 'm': return v * 100
        case 'in':
        case 'inch':
        case 'inches':
          return v * 2.54
        case 'cm':
        default:
          return v
      }
    }

    // Determine a global unit if some dimensions omit units (common: only last has unit)
    const globalUnit = (u3 || u2 || u1 || 'cm')
    const length = toCm(v1, u1 || globalUnit)
    const width = toCm(v2, u2 || globalUnit)
    const height = toCm(v3, u3 || globalUnit)
    return { length, width, height }
  }
  return { length: 20, width: 15, height: 10 } // fallback L×W×H
})

// Directly feed L×W×H to IsometricPackageBox
const dimsForPreview = computed(() => parsedDimensions.value)
</script>
