<template>
  <teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="onClose" />

      <!-- Modal -->
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <section class="w-[520px] max-w-full rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
          <!-- Header -->
          <header class="relative px-6 pt-5 pb-3">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-blue-500" />
                  <h3 class="text-xl font-semibold">New Pickup Request</h3>
                </div>
                <p class="text-sm text-gray-500 mt-1">A new delivery opportunity is available in your area</p>
              </div>

              <div class="flex items-center gap-2">
                <span :class="priorityBadge" class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium">
                  <span class="h-2 w-2 rounded-full" :class="priorityDot" />
                  {{ request.priority }}
                </span>
                <button class="h-8 w-8 grid place-items-center rounded hover:bg-gray-50" aria-label="Close" @click="onClose">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <!-- Body -->
          <div class="px-6 pb-4 space-y-4">
            <!-- Pickup / Dropoff -->
            <div class="grid grid-cols-2 gap-4 relative">
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-blue-700 font-medium">
                  <MapPin class="w-4 h-4" />
                  <span class="hover:underline">Pickup from:</span>
                </div>
                <div class="font-semibold">{{ request.pickup.name }}</div>
                <div class="text-xs text-gray-500">{{ request.pickup.address }}</div>
              </div>

              <div class="space-y-1 text-right">
                <div class="flex items-center justify-end gap-2 text-green-700 font-medium">
                  <Home class="w-4 h-4" />
                  <span class="hover:underline">Deliver to:</span>
                </div>
                <div class="font-semibold">{{ request.dropoff.name }}</div>
                <div class="text-xs text-gray-500">{{ request.dropoff.address }}</div>
              </div>

              <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400">
                <ArrowRight class="w-5 h-5" />
              </div>
            </div>

            <!-- Metrics -->
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <div class="text-3xl font-semibold text-blue-700">{{ request.etaMinutes }} min</div>
                <div class="text-xs text-gray-500">Estimated Time</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-semibold text-fuchsia-600">{{ request.distanceKm.toFixed(1) }} km</div>
                <div class="text-xs text-gray-500">Distance</div>
              </div>
            </div>

            <!-- Package Details -->
            <div class="border rounded-xl p-4 grid grid-cols-[1fr,110px] gap-4 items-center">
              <div class="space-y-1">
                <div class="font-semibold">Package Details</div>
                <div class="text-sm">{{ request.dimensions }}</div>
                <div class="text-sm flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 text-orange-700">
                    <span class="h-2 w-2 rounded-full bg-orange-600"></span>
                    {{ request.weightKg.toFixed(1) }}kg
                  </span>
                  <span class="text-gray-500">Volume: {{ request.volumeL.toFixed(1) }}L</span>
                </div>
              </div>
              <!-- simple package illustration -->
              <div class="h-20 w-full rounded-lg bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 grid place-items-center">
                <Package class="w-6 h-6 text-indigo-700" />
              </div>
            </div>

            <!-- Expires -->
            <div class="space-y-2">
              <div class="h-3 w-full rounded-full bg-red-50 border border-red-100 overflow-hidden">
                <div class="h-full bg-red-200" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <div class="rounded-xl bg-red-50 text-red-700 px-4 py-2 flex items-center justify-between border border-red-100">
                <div class="flex items-center gap-2">
                  <AlarmClock class="w-4 h-4" />
                  <span class="font-medium">Expires in {{ formattedRemaining }}</span>
                </div>
                <span v-if="expired" class="text-xs font-medium">Expired</span>
              </div>
            </div>

            <!-- Fee -->
            <div class="rounded-xl bg-gradient-to-b from-green-50 to-white px-4 py-3 text-center border">
              <div class="text-2xl font-bold text-green-700">{{ request.feeKr }} kr</div>
              <div class="text-xs text-green-700/80">delivery fee</div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="px-6 pb-5 pt-2 flex items-center justify-between gap-3">
            <button class="h-10 px-4 rounded-full border bg-white hover:bg-gray-50 flex-1 flex items-center justify-center gap-2" @click="onDecline">
              <X class="w-4 h-4 text-gray-600" />
              <span>Decline</span>
            </button>
            <button class="h-10 px-4 rounded-full bg-green-600 text-white hover:bg-green-700 flex-1 disabled:opacity-60 flex items-center justify-center gap-2" :disabled="expired" @click="onAccept">
              <Check class="w-4 h-4" />
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
import { X, Home, ArrowRight, Package, Check, MapPin, AlarmClock } from 'lucide-vue-next'
import type { NewPickupRequest } from '@/types/pickups'

const props = defineProps<{
  modelValue: boolean
  request: NewPickupRequest
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'accept', request: NewPickupRequest): void
  (e: 'decline', request: NewPickupRequest): void
  (e: 'expired', request: NewPickupRequest): void
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
    if (v) startTimer(props.request.expiresInSeconds)
    else stopTimer()
  },
  { immediate: true }
)

onUnmounted(stopTimer)

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
</script>
