<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[1200]">
      <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <section class="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
          <header class="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Package Details</h3>
              <p class="text-xs text-gray-500" v-if="assignmentId">Assignment #{{ assignmentId }}</p>
            </div>
            <button class="h-8 w-8 rounded-full hover:bg-gray-100 grid place-items-center" @click="emit('close')" aria-label="Close">
              <X class="w-4 h-4" />
            </button>
          </header>

          <div class="max-h-[60vh] overflow-y-auto divide-y">
            <div v-if="!packages.length" class="px-4 py-6 text-sm text-gray-500">No package details available.</div>
            <article v-for="pkg in packages" :key="pkg.id ?? pkg.description" class="px-4 py-3 space-y-2">
              <div class="flex items-center justify-between">
                <div class="text-sm font-semibold">Package {{ pkg.id ?? 'unknown' }}</div>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="pkg.hazardous ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'">
                  {{ pkg.hazardous ? 'Hazardous' : 'Eco' }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <div class="font-medium text-gray-800">Description</div>
                  <div>{{ pkg.description || '-' }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-800">Weight</div>
                  <div>{{ formatWeight(pkg) }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-800">Dimensions</div>
                  <div>{{ formatDimensions(pkg) }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-800">Status</div>
                  <div class="capitalize">{{ (pkg.delivery_status || 'pending').replace(/_/g, ' ') }}</div>
                </div>
              </div>
              <div class="text-xs text-gray-600">
                <div class="font-medium text-gray-800 mb-1">Handling</div>
                <ul class="list-disc ml-4 space-y-0.5">
                  <li v-if="pkg.fragile">Fragile - handle with care</li>
                  <li v-if="pkg.temperature_c">Temperature sensitive: {{ formatTemperature(pkg) }}</li>
                  <li v-if="!pkg.fragile && !pkg.temperature_c">No special handling notes.</li>
                </ul>
              </div>
            </article>
          </div>

          <footer class="px-4 py-3 border-t flex items-center justify-end gap-2">
            <button class="h-9 px-3 text-sm rounded border bg-white hover:bg-gray-50" @click="emit('close')">
              Close
            </button>
            <button class="h-9 px-3 text-sm rounded bg-blue-600 text-white hover:bg-blue-700" @click="emit('scan')">
              Scan & Confirm
            </button>
          </footer>
        </section>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { Package } from '@/types/api'

const props = defineProps<{
  open: boolean
  packages?: Package[]
  assignmentId?: string | number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'scan'): void
}>()

const packages = computed(() => props.packages || [])
const assignmentId = computed(() => props.assignmentId)

function formatWeight(pkg: Package) {
  if (!pkg.weight) return '-'
  const unit = pkg.weight_unit || 'kg'
  return `${pkg.weight} ${unit}`
}

function formatDimensions(pkg: Package) {
  if (!pkg.length || !pkg.width || !pkg.height) return '-'
  const unit = pkg.dimension_unit || 'cm'
  return `${pkg.length}x${pkg.width}x${pkg.height} ${unit}`
}

function formatTemperature(pkg: Package) {
  const unit = pkg.temperature_unit || 'C'
  return `${pkg.temperature_c} ${unit}`
}
</script>
