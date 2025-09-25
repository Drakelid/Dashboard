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
            <article
              v-for="pkg in packages"
              :key="pkg.id ?? pkg.description"
              class="px-4 py-4 space-y-4 odd:bg-white even:bg-gray-50/60"
            >
              <header class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-1">
                  <p class="text-sm font-semibold text-gray-900">Package {{ formatPackageId(pkg) }}</p>
                  <p class="text-xs text-gray-500">{{ pkg.description || 'No description provided.' }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide"
                    :class="statusVariant(pkg).class"
                  >
                    {{ statusVariant(pkg).label }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium"
                    :class="hazardBadge(pkg).class"
                  >
                    {{ hazardBadge(pkg).label }}
                  </span>
                </div>
              </header>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
                <div class="space-y-1">
                  <span class="font-medium text-gray-700 uppercase tracking-wide">Weight</span>
                  <span class="text-sm font-semibold text-gray-900">{{ formatWeight(pkg) }}</span>
                </div>
                <div class="space-y-1">
                  <span class="font-medium text-gray-700 uppercase tracking-wide">Dimensions</span>
                  <span class="text-sm font-semibold text-gray-900">{{ formatDimensions(pkg) }}</span>
                </div>
                <div class="space-y-1">
                  <span class="font-medium text-gray-700 uppercase tracking-wide">Volume</span>
                  <span class="text-sm font-semibold text-gray-900">{{ formatVolume(pkg) }}</span>
                </div>
                <div class="space-y-1">
                  <span class="font-medium text-gray-700 uppercase tracking-wide">Status</span>
                  <span class="text-sm font-semibold text-gray-900">{{ formatStatus(pkg) }}</span>
                </div>
              </div>

              <footer class="pt-3 border-t border-dashed">
                <div class="flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    v-for="tag in handlingTags(pkg)"
                    :key="tag.label"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-medium"
                    :class="tag.class"
                  >
                    {{ tag.label }}
                  </span>
                </div>
              </footer>
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

function formatVolume(pkg: Package) {
  if (pkg.volume_liters != null) return `${pkg.volume_liters} L`
  if (pkg.length && pkg.width && pkg.height) {
    const volume = Number(pkg.length) * Number(pkg.width) * Number(pkg.height)
    if (Number.isFinite(volume)) {
      return `${volume} ${pkg.dimension_unit || 'cm'}³`
    }
  }
  return '-'
}

function formatStatus(pkg: Package) {
  const status = (pkg.delivery_status || 'pending').replace(/_/g, ' ')
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusVariant(pkg: Package) {
  const status = (pkg.delivery_status || '').toLowerCase()
  if (status.includes('delivered')) {
    return { label: 'Delivered', class: 'border-green-600 text-green-700 bg-green-50' }
  }
  if (status.includes('picked')) {
    return { label: 'Picked up', class: 'border-blue-600 text-blue-700 bg-blue-50' }
  }
  if (status.includes('exception') || status.includes('issue')) {
    return { label: 'Needs attention', class: 'border-orange-500 text-orange-600 bg-orange-50' }
  }
  return { label: 'Pending', class: 'border-gray-300 text-gray-600 bg-gray-50' }
}

function hazardBadge(pkg: Package) {
  if (pkg.hazardous) {
    return { label: 'Hazardous', class: 'border-orange-500 text-orange-600 bg-orange-50' }
  }
  if (pkg.fragile) {
    return { label: 'Fragile', class: 'border-rose-500 text-rose-600 bg-rose-50' }
  }
  return { label: 'Standard', class: 'border-emerald-500 text-emerald-600 bg-emerald-50' }
}

function handlingTags(pkg: Package) {
  const tags: Array<{ label: string; class: string }> = []
  if (pkg.fragile) tags.push({ label: 'Fragile item', class: 'border-rose-400 text-rose-600 bg-rose-50' })
  if (pkg.temperature_c != null) tags.push({ label: `Keep at ${formatTemperature(pkg)}`, class: 'border-sky-400 text-sky-600 bg-sky-50' })
  if (pkg.hazardous) tags.push({ label: 'Hazard handling required', class: 'border-orange-400 text-orange-600 bg-orange-50' })
  if (!tags.length) tags.push({ label: 'No special handling', class: 'border-gray-300 text-gray-600 bg-gray-50' })
  return tags
}

function formatPackageId(pkg: Package) {
  return pkg.id != null ? `#${pkg.id}` : 'N/A'
}
</script>
