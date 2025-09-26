<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[1200]">
      <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <section class="w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
          <header class="relative px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="text-lg font-semibold tracking-wide">Package Details</h3>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <p v-if="assignmentId">Assignment #{{ assignmentId }}</p>
                  <span v-if="packageSummary.total" class="inline-flex items-center gap-2">
                    <span class="inline-block h-1 w-1 rounded-full bg-white/60"></span>
                    Updated insights
                  </span>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                <span
                  v-if="packageSummary.total"
                  class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide shadow-sm backdrop-blur-sm"
                >
                  <PackageIcon class="w-4 h-4" />
                  {{ packageSummary.total }} {{ packageSummary.total === 1 ? 'package' : 'packages' }}
                </span>
                <span
                  v-if="packageSummary.hasWeight"
                  class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide shadow-sm backdrop-blur-sm"
                >
                  <Weight class="w-4 h-4" />
                  {{ packageSummary.weightLabel }}
                </span>
                <span
                  v-if="packageSummary.fragile"
                  class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide shadow-sm backdrop-blur-sm"
                >
                  <AlertTriangle class="w-4 h-4" />
                  {{ packageSummary.fragile }} fragile
                </span>
                <span
                  v-if="packageSummary.hazardous"
                  class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide shadow-sm backdrop-blur-sm"
                >
                  <ShieldAlert class="w-4 h-4" />
                  {{ packageSummary.hazardous }} hazardous
                </span>
                <span
                  v-if="packageSummary.temperatureSensitive"
                  class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide shadow-sm backdrop-blur-sm"
                >
                  <ThermometerSun class="w-4 h-4" />
                  {{ packageSummary.temperatureSensitive }} temp sensitive
                </span>
              </div>
            </div>
            <button
              class="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center transition text-white"
              @click="emit('close')"
              aria-label="Close"
            >
              <X class="w-4 h-4" />
            </button>
          </header>

          <div class="bg-slate-50/80 px-6 py-5 max-h-[60vh] overflow-y-auto">
            <div
              v-if="!packageList.length"
              class="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-center text-sm text-slate-500"
            >
              No package details available.
            </div>
            <div v-else class="space-y-4">
              <article
                v-for="pkg in packageList"
                :key="pkg.id ?? pkg.description"
                class="rounded-2xl border border-slate-200 bg-white/95 shadow-sm px-5 py-5 space-y-5 backdrop-blur-sm"
              >
                <header class="flex flex-wrap items-start justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-600 grid place-items-center">
                      <PackageIcon class="w-5 h-5" />
                    </div>
                    <div class="space-y-1">
                      <p class="text-base font-semibold text-slate-900">Package {{ formatPackageId(pkg) }}</p>
                      <p class="text-xs text-slate-500">{{ pkg.description || 'No description provided.' }}</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                      :class="statusVariant(pkg).class"
                    >
                      <component :is="statusVariant(pkg).icon" class="w-3.5 h-3.5" />
                      {{ statusVariant(pkg).label }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium"
                      :class="hazardBadge(pkg).class"
                    >
                      <component :is="hazardBadge(pkg).icon" class="w-3.5 h-3.5" />
                      {{ hazardBadge(pkg).label }}
                    </span>
                  </div>
                </header>

                <div class="grid gap-4 md:grid-cols-2">
                  <div class="space-y-2 rounded-xl border border-slate-100 bg-white/80 px-4 py-3">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Weight</span>
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Weight class="w-4 h-4 text-slate-400" />
                      <span>{{ formatWeight(pkg) }}</span>
                    </div>
                  </div>
                  <div class="space-y-2 rounded-xl border border-slate-100 bg-white/80 px-4 py-3">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Dimensions</span>
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Ruler class="w-4 h-4 text-slate-400" />
                      <span>{{ formatDimensions(pkg) }}</span>
                    </div>
                  </div>
                  <div class="space-y-2 rounded-xl border border-slate-100 bg-white/80 px-4 py-3">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Volume</span>
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <PackageIcon class="w-4 h-4 text-slate-400" />
                      <span>{{ formatVolume(pkg) }}</span>
                    </div>
                  </div>
                  <div class="space-y-2 rounded-xl border border-slate-100 bg-white/80 px-4 py-3">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <component :is="statusVariant(pkg).icon" class="w-4 h-4 text-slate-400" />
                      <span>{{ formatStatus(pkg) }}</span>
                    </div>
                  </div>
                  <div v-if="hasTemperature(pkg)" class="space-y-2 rounded-xl border border-slate-100 bg-white/80 px-4 py-3 md:col-span-2">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Temperature guidance</span>
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <ThermometerSun class="w-4 h-4 text-slate-400" />
                      <span>{{ formatTemperature(pkg) }}</span>
                    </div>
                  </div>
                </div>

                <footer class="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3">
                  <div class="flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      v-for="tag in handlingTags(pkg)"
                      :key="tag.label"
                      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium shadow-sm"
                      :class="tag.class"
                    >
                      <component :is="tag.icon" class="w-3.5 h-3.5" />
                      {{ tag.label }}
                    </span>
                  </div>
                </footer>
              </article>
            </div>
          </div>

          <footer class="px-6 py-4 border-t flex items-center justify-end gap-2 bg-white">
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
import {
  AlertTriangle,
  ClipboardCheck,
  Package as PackageIcon,
  Ruler,
  ShieldAlert,
  ThermometerSnowflake,
  ThermometerSun,
  Weight,
  X,
  CircleCheck,
  CircleDot
} from 'lucide-vue-next'
import type { Package } from '@/types/api'

type ExtendedPackage = Package & {
  id?: number | string
  description?: string
  weight?: number | string
  weight_unit?: string
  length?: number | string
  width?: number | string
  height?: number | string
  dimension_unit?: string
  temperature_c?: number | string
  temperature_range?: string
  temperature_unit?: string
  volume_liters?: number | string
  delivery_status?: string
  fragile?: boolean
  hazardous?: boolean
}

interface PackageSummary {
  total: number
  hasWeight: boolean
  weightLabel: string
  fragile: number
  hazardous: number
  temperatureSensitive: number
}

type VariantBadge = {
  label: string
  class: string
  icon: any
}

type HandlingTag = {
  label: string
  class: string
  icon: any
}

const props = defineProps<{
  open: boolean
  packages?: ExtendedPackage[]
  assignmentId?: string | number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'scan'): void
}>()

const packageList = computed<ExtendedPackage[]>(() => (props.packages as ExtendedPackage[] | undefined) ?? [])
const assignmentId = computed(() => props.assignmentId)

const packageSummary = computed<PackageSummary>(() => {
  const list = packageList.value
  const result: PackageSummary = {
    total: list.length,
    hasWeight: false,
    weightLabel: '',
    fragile: 0,
    hazardous: 0,
    temperatureSensitive: 0,
  }

  let totalWeight = 0
  let weightUnit: string | null = null
  for (const pkg of list) {
    const weightValue = toNumber(pkg.weight)
    if (weightValue != null) {
        totalWeight += weightValue
        result.hasWeight = true
        weightUnit = weightUnit || pkg.weight_unit || 'kg'
      }
    if (pkg.fragile) result.fragile += 1
    if (pkg.hazardous) result.hazardous += 1
    if (pkg.temperature_c != null || pkg.temperature_range) result.temperatureSensitive += 1
  }

  if (result.hasWeight) {
    result.weightLabel = `${Math.round(totalWeight * 10) / 10} ${weightUnit || 'kg'} total`
  }

  return result
})

function toNumber(value: number | string | undefined | null): number | null {
  if (value == null) return null
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

function formatWeight(pkg: ExtendedPackage) {
  if (!pkg.weight) return '-'
  const unit = pkg.weight_unit || 'kg'
  return `${pkg.weight} ${unit}`
}

function formatDimensions(pkg: ExtendedPackage) {
  if (!pkg.length || !pkg.width || !pkg.height) return '-'
  const unit = pkg.dimension_unit || 'cm'
  return `${pkg.length}x${pkg.width}x${pkg.height} ${unit}`
}

function formatTemperature(pkg: ExtendedPackage) {
  if (pkg.temperature_range) return pkg.temperature_range
  if (pkg.temperature_c == null) return 'No specific range'
  const unit = pkg.temperature_unit || '°C'
  return `${pkg.temperature_c} ${unit}`
}

function formatVolume(pkg: ExtendedPackage) {
  if (pkg.volume_liters != null) return `${pkg.volume_liters} L`
  const length = toNumber(pkg.length)
  const width = toNumber(pkg.width)
  const height = toNumber(pkg.height)
  if (length != null && width != null && height != null) {
    const volumeCalc = length * width * height
    if (Number.isFinite(volumeCalc)) {
      const unit = pkg.dimension_unit || 'cm'
      return `${Math.round(volumeCalc)} ${unit}³`
    }
  }
  return '-'
}

function formatStatus(pkg: ExtendedPackage) {
  const status = (pkg.delivery_status || 'pending').replace(/_/g, ' ')
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusVariant(pkg: ExtendedPackage): VariantBadge {
  const status = (pkg.delivery_status || '').toLowerCase()
  if (status.includes('delivered')) {
    return { label: 'Delivered', class: 'border-green-600 text-green-700 bg-green-50', icon: CircleCheck }
  }
  if (status.includes('picked')) {
    return { label: 'Picked up', class: 'border-blue-600 text-blue-700 bg-blue-50', icon: ClipboardCheck }
  }
  if (status.includes('exception') || status.includes('issue')) {
    return { label: 'Needs attention', class: 'border-orange-500 text-orange-600 bg-orange-50', icon: AlertTriangle }
  }
  return { label: 'Pending', class: 'border-gray-300 text-gray-600 bg-gray-50', icon: CircleDot }
}

function hazardBadge(pkg: ExtendedPackage): VariantBadge {
  if (pkg.hazardous) {
    return { label: 'Hazardous', class: 'border-orange-500 text-orange-600 bg-orange-50', icon: ShieldAlert }
  }
  if (pkg.fragile) {
    return { label: 'Fragile', class: 'border-rose-500 text-rose-600 bg-rose-50', icon: AlertTriangle }
  }
  return { label: 'Standard', class: 'border-emerald-500 text-emerald-600 bg-emerald-50', icon: PackageIcon }
}

function handlingTags(pkg: ExtendedPackage): HandlingTag[] {
  const tags: HandlingTag[] = []
  if (pkg.fragile) tags.push({ label: 'Fragile item', class: 'border-rose-400 text-rose-600 bg-rose-50', icon: AlertTriangle })
  if (pkg.temperature_c != null || pkg.temperature_range) tags.push({ label: `Keep at ${formatTemperature(pkg)}`, class: 'border-sky-400 text-sky-600 bg-sky-50', icon: ThermometerSnowflake })
  if (pkg.hazardous) tags.push({ label: 'Hazard handling required', class: 'border-orange-400 text-orange-600 bg-orange-50', icon: ShieldAlert })
  if (!tags.length) tags.push({ label: 'No special handling', class: 'border-gray-300 text-gray-600 bg-gray-50', icon: PackageIcon })
  return tags
}

function hasTemperature(pkg: ExtendedPackage) {
  return pkg.temperature_c != null || pkg.temperature_range != null
}

function formatPackageId(pkg: ExtendedPackage) {
  return pkg.id != null ? `#${pkg.id}` : 'N/A'
}
</script>
