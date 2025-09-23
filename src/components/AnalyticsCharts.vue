<template>
  <section class="grid gap-6 lg:grid-cols-2">
    <!-- Weekly Earnings -->
    <div class="rounded-xl border bg-white p-6">
      <h3 class="font-semibold mb-3">Weekly Earnings</h3>
      <div class="h-56">
        <Bar :data="weeklyEarningsData" :options="barOptions" />
      </div>
    </div>

    <!-- User Signups (Live) -->
    <div class="rounded-xl border bg-white p-6 relative">
      <h3 class="font-semibold mb-3">User Signups</h3>
      <div class="h-56">
        <Line :data="signupsData" :options="lineOptions" />
      </div>
      <div v-if="statsLoading" class="absolute inset-0 bg-white/60 grid place-items-center pointer-events-none">
        <Spinner />
      </div>
    </div>

    <!-- Delivery Types -->
    <div class="rounded-xl border bg-white p-6">
      <h3 class="font-semibold mb-3">Delivery Types</h3>
      <div class="h-56">
        <Pie :data="deliveryTypeData" :options="pieOptions" />
      </div>
    </div>

    <!-- Hourly Activity -->
    <div class="rounded-xl border bg-white p-6">
      <h3 class="font-semibold mb-3">Hourly Activity</h3>
      <div class="h-56">
        <Bar :data="hourlyActivityData" :options="barOptions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Bar, Line, Pie } from 'vue-chartjs'
import 'chart.js/auto'
import { computed, onMounted, ref } from 'vue'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { useDriverDeliveries } from '@/composables/useDriverDeliveries'
import Spinner from '@/components/Spinner.vue'

const fallbackColors = {
  green: '#22c55e',
  greenSoft: '#bbf7d0',
  blue: '#3b82f6',
  blueSoft: '#bfdbfe',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  slate: '#64748b',
  grid: '#e5e7eb',
}

const themePalette = ref({
  green: fallbackColors.green,
  greenSoft: fallbackColors.greenSoft,
  blue: fallbackColors.blue,
  blueSoft: fallbackColors.blueSoft,
  purple: fallbackColors.purple,
  amber: fallbackColors.amber,
  slate: fallbackColors.slate,
  grid: fallbackColors.grid,
})

const fallbackWeekly = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [1895, 2342, 1988, 2673, 2984, 1563, 2018],
}

const fallbackSignups = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [10, 12, 9, 14, 18, 16],
}

const fallbackTypes = { standard: 60, express: 25, eco: 15 }
const fallbackHourly = {
  labels: ['08', '09', '10', '11', '12', '13', '14', '15', '16'],
  values: [2, 4, 6, 5, 7, 8, 6, 4, 3],
}

const { stats, load: loadStats, loading: statsLoading } = useDashboardStats()
const {
  past,
  future,
  loading: deliveriesLoading,
  loadPast,
  loadFuture,
} = useDriverDeliveries()

function resolveColor(variable: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  if (!value || value.startsWith('oklch')) return fallback
  return value
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized.length === 3 ? normalized.split('').map(ch => ch + ch).join('') : normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function rgbStringToRgba(color: string, alpha: number, fallback: string) {
  const cleaned = color.replace(/\//g, '').replace(/[a-zA-Z()]/g, ' ').replace(/\s+/g, ' ').trim()
  const parts = cleaned.split(/[, ]/).filter(Boolean).map(Number)
  if (parts.length >= 3 && parts.every(n => Number.isFinite(n))) {
    const [r, g, b] = parts
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return hexToRgba(fallback, alpha)
}

function withAlpha(color: string, alpha: number, fallback: string) {
  if (color.startsWith('#')) return hexToRgba(color, alpha)
  if (color.startsWith('rgb')) return rgbStringToRgba(color, alpha, fallback)
  return hexToRgba(fallback, alpha)
}

function refreshPalette() {
  themePalette.value = {
    green: resolveColor('--color-green-500', fallbackColors.green),
    greenSoft: resolveColor('--color-green-200', fallbackColors.greenSoft),
    blue: resolveColor('--color-blue-500', fallbackColors.blue),
    blueSoft: resolveColor('--color-blue-200', fallbackColors.blueSoft),
    purple: resolveColor('--color-purple-500', fallbackColors.purple),
    amber: resolveColor('--color-yellow-500', fallbackColors.amber),
    slate: resolveColor('--color-gray-600', fallbackColors.slate),
    grid: resolveColor('--color-gray-200', fallbackColors.grid),
  }
}

function coerceNumber(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function deliveryEarnings(item: any): number {
  const delivery = item?.delivery ?? {}
  const candidates = [delivery.fee, delivery.price, delivery.total_price, delivery.delivery_fee]
  for (const candidate of candidates) {
    const coerced = coerceNumber(candidate)
    if (coerced != null) return coerced
  }
  return 0
}

const weeklyEarningsData = computed(() => {
  const entries = past.value ?? []
  if (!entries.length) {
    return {
      labels: fallbackWeekly.labels,
      datasets: [
        {
          label: 'Earnings (kr)',
          data: fallbackWeekly.values,
          backgroundColor: withAlpha(themePalette.value.green, 0.55, fallbackColors.green),
          borderColor: themePalette.value.green,
          borderWidth: 2,
          maxBarThickness: 18,
          borderRadius: 8,
        },
      ],
    }
  }

  const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const range = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - idx))
    const key = date.toISOString().slice(0, 10)
    return { key, label: dayFormatter.format(date) }
  })

  const totals = new Map<string, number>()
  for (const item of entries) {
    const key = item?.delivery?.delivery_date || item?.delivery?.pickup_date || item?.date
    if (!key) continue
    totals.set(key, (totals.get(key) ?? 0) + deliveryEarnings(item))
  }

  const dataset = range.map(day => totals.get(day.key) ?? 0)

  return {
    labels: range.map(day => day.label),
    datasets: [
      {
        label: 'Earnings (kr)',
        data: dataset,
        backgroundColor: withAlpha(themePalette.value.green, 0.55, fallbackColors.green),
        borderColor: themePalette.value.green,
        borderWidth: 2,
        maxBarThickness: 18,
        borderRadius: 8,
      },
    ],
  }
})

const signupsData = computed(() => {
  const entries = stats.value ?? []
  const baseColor = themePalette.value.blue
  if (!entries.length) {
    return {
      labels: fallbackSignups.labels,
      datasets: [
        {
          label: 'Signups',
          data: fallbackSignups.values,
          borderColor: baseColor,
          backgroundColor: withAlpha(baseColor, 0.2, fallbackColors.blue),
          fill: true,
          tension: 0.35,
        },
      ],
    }
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
  const sorted = [...entries]
    .map(entry => {
      const parsed = new Date(entry.date)
      return { ...entry, parsed }
    })
    .filter(entry => !Number.isNaN(entry.parsed.getTime()))
    .sort((a, b) => a.parsed.getTime() - b.parsed.getTime())
    .slice(-7)

  const labels = sorted.map(entry => dateFormatter.format(entry.parsed))
  const data = sorted.map(entry => entry.count)

  return {
    labels,
    datasets: [
      {
        label: 'Signups',
        data,
        borderColor: baseColor,
        backgroundColor: withAlpha(baseColor, 0.2, fallbackColors.blue),
        fill: true,
        tension: 0.35,
      },
    ],
  }
})

const deliveryTypeData = computed(() => {
  const entries = [...(past.value ?? []), ...(future.value ?? [])]
  if (!entries.length) {
    return {
      labels: ['Standard', 'Express', 'Eco'],
      datasets: [
        {
          label: 'Deliveries',
          data: [fallbackTypes.standard, fallbackTypes.express, fallbackTypes.eco],
          backgroundColor: [
            withAlpha(themePalette.value.blue, 0.5, fallbackColors.blue),
            withAlpha(themePalette.value.purple, 0.5, fallbackColors.purple),
            withAlpha(themePalette.value.green, 0.5, fallbackColors.green),
          ],
          borderColor: [themePalette.value.blue, themePalette.value.purple, themePalette.value.green],
          borderWidth: 1.5,
        },
      ],
    }
  }

  const counts = { standard: 0, express: 0, eco: 0 }
  for (const item of entries) {
    const service = String(item?.delivery?.service || '').toLowerCase()
    const packages = Array.isArray(item?.packages) ? item.packages : []
    const hasPackages = packages.length > 0
    const allEco = hasPackages && packages.every((pkg: any) => pkg && pkg.hazardous === false)
    if (service.includes('express')) {
      counts.express += 1
    } else if (service.includes('eco') || allEco) {
      counts.eco += 1
    } else {
      counts.standard += 1
    }
  }

  const total = counts.standard + counts.express + counts.eco
  if (total === 0) {
    return {
      labels: ['Standard', 'Express', 'Eco'],
      datasets: [
        {
          label: 'Deliveries',
          data: [0, 0, 0],
          backgroundColor: [
            withAlpha(themePalette.value.blue, 0.5, fallbackColors.blue),
            withAlpha(themePalette.value.purple, 0.5, fallbackColors.purple),
            withAlpha(themePalette.value.green, 0.5, fallbackColors.green),
          ],
          borderColor: [themePalette.value.blue, themePalette.value.purple, themePalette.value.green],
          borderWidth: 1.5,
        },
      ],
    }
  }

  return {
    labels: ['Standard', 'Express', 'Eco'],
    datasets: [
      {
        label: 'Deliveries',
        data: [counts.standard, counts.express, counts.eco],
        backgroundColor: [
          withAlpha(themePalette.value.blue, 0.5, fallbackColors.blue),
          withAlpha(themePalette.value.purple, 0.5, fallbackColors.purple),
          withAlpha(themePalette.value.green, 0.5, fallbackColors.green),
        ],
        borderColor: [themePalette.value.blue, themePalette.value.purple, themePalette.value.green],
        borderWidth: 1.5,
      },
    ],
  }
})

const hourlyActivityData = computed(() => {
  const upcoming = future.value ?? []
  if (!upcoming.length) {
    return {
      labels: fallbackHourly.labels,
      datasets: [
        {
          label: 'Deliveries',
          data: fallbackHourly.values,
          backgroundColor: withAlpha(themePalette.value.blue, 0.55, fallbackColors.blue),
          borderColor: themePalette.value.blue,
          borderWidth: 2,
          maxBarThickness: 18,
          borderRadius: 6,
        },
      ],
    }
  }

  const counts = new Map<number, number>()
  for (const item of upcoming) {
    const time = item?.pickup_time || item?.delivery?.pickup_time || item?.delivery?.delivery_time || item?.time
    if (!time || typeof time !== 'string') continue
    const hour = Number.parseInt(time.slice(0, 2), 10)
    if (!Number.isFinite(hour)) continue
    counts.set(hour, (counts.get(hour) ?? 0) + 1)
  }

  if (counts.size === 0) {
    return {
      labels: fallbackHourly.labels,
      datasets: [
        {
          label: 'Deliveries',
          data: fallbackHourly.values,
          backgroundColor: withAlpha(themePalette.value.blue, 0.55, fallbackColors.blue),
          borderColor: themePalette.value.blue,
          borderWidth: 2,
          maxBarThickness: 18,
          borderRadius: 6,
        },
      ],
    }
  }

  const formatter = (hour: number) => `${hour.toString().padStart(2, '0')}:00`
  const hours = [...counts.keys()].sort((a, b) => a - b)
  const data = hours.map(hour => counts.get(hour) ?? 0)

  return {
    labels: hours.map(formatter),
    datasets: [
      {
        label: 'Deliveries',
        data,
        backgroundColor: withAlpha(themePalette.value.blue, 0.55, fallbackColors.blue),
        borderColor: themePalette.value.blue,
        borderWidth: 2,
        maxBarThickness: 18,
        borderRadius: 6,
      },
    ],
  }
})

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: themePalette.value.slate },
    },
    y: {
      grid: { color: withAlpha(themePalette.value.grid, 0.6, fallbackColors.grid) },
      ticks: { color: themePalette.value.slate },
    },
  },
}))

const lineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: themePalette.value.slate },
    },
    y: {
      grid: { color: withAlpha(themePalette.value.grid, 0.6, fallbackColors.grid) },
      ticks: { color: themePalette.value.slate },
    },
  },
}))

const pieOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: themePalette.value.slate,
      },
    },
  },
}))

onMounted(async () => {
  refreshPalette()
  const tasks: Promise<unknown>[] = []
  try {
    if (!stats.value?.length && !statsLoading.value) {
      tasks.push(loadStats().catch(() => null))
    }
    if (!past.value && !deliveriesLoading.value) {
      tasks.push(loadPast().catch(() => null))
    }
    if (!future.value && !deliveriesLoading.value) {
      tasks.push(loadFuture().catch(() => null))
    }
    if (tasks.length) {
      await Promise.allSettled(tasks)
    }
  } catch {
    // handled individually
  }
})
</script>
