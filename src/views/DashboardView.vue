<template>
  <section class="relative z-0 space-y-6 pb-10">
    <div v-if="isLoading" class="absolute inset-0 z-10 bg-white/70 grid place-items-center">
      <Spinner />
    </div>
    <!-- Welcome / Summary Banner -->
    <div class="relative z-0 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white">
      <div class="relative z-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold mb-1">{{ greeting }}</h1>
          <p class="text-emerald-100 text-sm md:text-base">
            You have {{ quickStats.activeDeliveries }} active deliveries. Next pickup in {{ quickStats.nextDeliveryLabel }}.
          </p>
          <div class="flex items-center flex-wrap gap-3 mt-3 text-sm">
            <span class="px-2 py-1 rounded-lg bg-white/20 border border-white/30">Eco Score: <b>{{ quickStats.ecoScoreLabel }}</b></span>
            <span class="opacity-90">Today: <b>{{ quickStats.todayEarningsLabel }}</b></span>
            <span class="opacity-90">Standard fee: <b>{{ quickStats.deliveryFeeLabel }}</b></span>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="px-3 py-2 tap-target rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 inline-flex items-center gap-2">
            <Map class="w-4 h-4" />
            <span>View Route</span>
          </button>
          <button class="px-3 py-2 tap-target rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 inline-flex items-center gap-2">
            <Play class="w-4 h-4" />
            <span>Start Next</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </div>
{{ ... }}
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Active Deliveries -->
          <div class="lg:col-span-2 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <span class="inline-block h-5 w-5 rounded-full bg-emerald-100 ring-2 ring-emerald-200 grid place-items-center text-emerald-600">
                  <Info class="w-3.5 h-3.5" />
                </span>
                Active Eco-Deliveries
              </h3>
            </div>
            <p class="text-sm text-gray-600">{{ quickStats.activeDeliveries }} active deliveries - {{ quickStats.deliveryFeeLabel }} standard fee - {{ quickStats.ecoFriendly }} eco-friendly packages</p>
            <TaskList
              variant="plain"
              :tasks="upcomingTasks"
              empty-text="No upcoming deliveries."
{{ ... }}
              @navigate="handleNavigate"
            />
          </div>

          <!-- Sidebar Summary -->
          <aside class="space-y-4">
            <DeliveryHistory :deliveries="pastDeliveries" />
          </aside>
        </div>
      </div>

      <!-- Analytics -->
      <div v-if="tab === 'analytics'" class="space-y-6">
        <AnalyticsCharts />
      </div>

      <!-- Tasks -->
      <div v-if="tab === 'tasks'" class="space-y-6">
        <TaskList
          :tasks="upcomingTasks"
          title="Upcoming Tasks"
          empty-text="No upcoming deliveries."
          @navigate="handleNavigate"
        />
      </div>

      <!-- Achievements -->
      <div v-if="tab === 'achievements'">
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="(ach, i) in achievements"
            :key="ach.title"
            class="p-4 rounded-lg border bg-white"
            :class="ach.earned ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <div class="font-medium">{{ ach.title }}</div>
                <div class="text-sm text-gray-500">{{ ach.description }}</div>
              </div>
              <div v-if="ach.earned" class="text-emerald-600 text-sm font-medium">Earned</div>
              <div v-else class="text-gray-500 text-sm font-medium">{{ ach.progress }}%</div>
            </div>
            <div v-if="!ach.earned" class="h-2 w-full rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-emerald-500" :style="{ width: (ach.progress || 0) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import OverviewCards from '@/components/OverviewCards.vue'
import AnalyticsCharts from '@/components/AnalyticsCharts.vue'
import DeliveryHistory from '@/components/DeliveryHistory.vue'
import Spinner from '@/components/Spinner.vue'
import { Info, Map, Play, Package, Banknote, Star, Clock } from 'lucide-vue-next'
import { useDriverProfile } from '@/composables/useDriverProfile'
import { useDriverDeliveries } from '@/composables/useDriverDeliveries'
import type { DriverDeliveryItem } from '@/types/api'
import TaskList from '@/components/TaskList.vue'
import type { DeliveryTask } from '@/types/tasks'

interface Achievement {
  title: string
  description: string
  earned: boolean
  progress?: number
}

const tab = ref<'overview' | 'analytics' | 'tasks' | 'achievements'>('overview')

const { profile, loading: profileLoading, error: profileError, load: loadProfile } = useDriverProfile()
const { future, past, loading: deliveriesLoading, error: deliveriesError, loadAll } = useDriverDeliveries()
const router = useRouter()

const isLoading = computed(() => profileLoading.value || deliveriesLoading.value)
const errorMessage = computed(() => profileError.value || deliveriesError.value || null)

onMounted(async () => {
  await Promise.allSettled([loadProfile(), loadAll()])
})

const futureDeliveries = computed<DriverDeliveryItem[]>(() => future.value || [])
const pastDeliveries = computed<DriverDeliveryItem[]>(() => past.value || [])

const greetingName = computed(() => {
  const user = profile.value?.user
  const parts = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
  return parts || user?.email || 'Driver'
})

function getGreetingPrefix() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const greeting = computed(() => `${getGreetingPrefix()}, ${greetingName.value}!`)

function parseDateTime(item: DriverDeliveryItem) {
  const date = item.pickup_date || item.delivery?.pickup_date || item.delivery?.delivery_date
  const time = item.pickup_time || item.delivery?.pickup_time || item.delivery?.delivery_time || '00:00:00'
  if (!date) return null
  const composed = `${date}T${time}`
  const d = new Date(composed)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatRelative(date: Date | null) {
  if (!date) return 'pending'
  const diff = date.getTime() - Date.now()
  const minutes = Math.round(diff / 60000)
  if (minutes <= 0) return 'due now'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function coerceNumber(...values: any[]): number | null {
  for (const val of values) {
    if (val == null) continue
    const num = typeof val === 'number' ? val : parseFloat(val)
    if (Number.isFinite(num)) return num
  }
  return null
}

function formatCurrency(value: number | null): string {
  if (value == null || value === 0) return 'n/a'
  return `kr ${Math.round(value).toLocaleString()}`
}

const todayIso = () => new Date().toISOString().slice(0, 10)

const quickStats = computed(() => {
  const activeDeliveries = futureDeliveries.value.length
  const nextDate = futureDeliveries.value
    .map(parseDateTime)
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime())[0] || null

  const pastToday = pastDeliveries.value.filter(item => (item.delivery?.delivery_date || item.delivery?.pickup_date) === todayIso())

  const totalPackages = futureDeliveries.value.reduce((sum, item) => sum + (item.packages?.length || 0), 0)
  const ecoFriendlyPackages = futureDeliveries.value.reduce((acc, item) => {
    const packages = item.packages || []
    return acc + packages.filter(pkg => !pkg.hazardous).length
  }, 0)

  const earningsValue = pastToday.reduce((sum, item) => {
    const delivery = item.delivery as any
    const value = coerceNumber(delivery?.fee, delivery?.price, delivery?.total_price, delivery?.delivery_fee)
    return sum + (value ?? 0)
  }, 0)

  const ratingValue = coerceNumber((profile.value as any)?.rating)
  const deliveryFeeValue = coerceNumber((profile.value as any)?.default_fee)
  const ecoScore = totalPackages > 0 ? Math.round((ecoFriendlyPackages / totalPackages) * 100) : null
  const todayEarningsValue = earningsValue > 0 ? earningsValue : null

  return {
    activeDeliveries,
    completedToday: pastToday.length,
    nextDeliveryLabel: formatRelative(nextDate),
    ecoScore,
    ecoScoreLabel: ecoScore != null ? `${ecoScore}%` : 'n/a',
    todayEarningsValue,
    todayEarningsLabel: formatCurrency(todayEarningsValue),
    deliveryFeeValue,
    deliveryFeeLabel: formatCurrency(deliveryFeeValue),
    ratingValue,
    ratingLabel: ratingValue != null ? ratingValue.toFixed(1) : 'n/a',
    totalPackages,
    ecoFriendly: ecoFriendlyPackages,
  }
})

function formatDistance(item: DriverDeliveryItem) {
  const distance = (item as any)?.distance_km || (item as any)?.distance
  const num = coerceNumber(distance)
  if (!num) return 'n/a'
  return `${num.toFixed(1)} km`
}

function formatEarnings(item: DriverDeliveryItem) {
  const delivery = item.delivery as any
  const value = coerceNumber(delivery?.fee, delivery?.price, delivery?.total_price, delivery?.delivery_fee)
  if (!value) return 'n/a'
  return formatCurrency(value)
}

function formatTime(item: DriverDeliveryItem) {
  const time = item.pickup_time || item.delivery?.pickup_time || item.delivery?.delivery_time
  if (!time) return 'n/a'
  return time.slice(0, 5)
}

function createTask(entry: DriverDeliveryItem): DeliveryTask {
  const packages = entry.packages || []
  const ecoFriendly = packages.every(pkg => !pkg.hazardous)
  return {
    id: String(entry.delivery?.id ?? (entry.delivery as any)?.uuid ?? entry.location ?? 'job'),
    type: entry.location?.toLowerCase().includes('pickup') ? 'pickup' : 'delivery',
    location: entry.location || entry.delivery?.delivery_location || 'Unknown location',
    address: entry.delivery?.delivery_location || entry.actor?.address || 'n/a',
    time: formatTime(entry),
    priority: 'standard',
    distance: formatDistance(entry),
    ecoFriendly,
    earnings: formatEarnings(entry),
  }
}

const upcomingTasks = computed<DeliveryTask[]>(() => {
  if (!futureDeliveries.value.length) return []
  return futureDeliveries.value.slice(0, 3).map(createTask)
})

function handleNavigate(task: DeliveryTask) {
  router.push({ name: 'active', query: { focus: task.id } })
}

const achievements = computed<Achievement[]>(() => {
  const stats = quickStats.value
  const ratingValue = stats.ratingValue ?? null
  return [
    {
      title: 'Eco Champion',
      description: 'Maintain high eco-friendly ratio',
      earned: (stats.ecoScore ?? 0) >= 80,
      progress: stats.ecoScore ?? 0,
    },
    {
      title: 'Active Today',
      description: 'Complete 5 deliveries today',
      earned: stats.completedToday >= 5,
      progress: Math.min(100, (stats.completedToday / 5) * 100),
    },
    {
      title: 'Customer Favorite',
      description: 'Average rating above 4.5',
      earned: ratingValue != null && ratingValue >= 4.5,
      progress: ratingValue != null ? Math.min(100, (ratingValue / 5) * 100) : 0,
    },
    {
      title: 'On-Time Pro',
      description: 'Keep upcoming jobs low',
      earned: stats.activeDeliveries <= 3,
      progress: stats.activeDeliveries > 0 ? Math.min(100, (3 / (stats.activeDeliveries || 1)) * 100) : 100,
    },
  ]
})

const overviewCardStats = computed(() => {
  const stats = quickStats.value
  const deliveryWindow = stats.completedToday + stats.activeDeliveries
  const progress = deliveryWindow > 0 ? Math.min(100, (stats.completedToday / deliveryWindow) * 100) : 0
  return [
    {
      title: "Today's Deliveries",
      value: String(stats.completedToday),
      description: `${stats.activeDeliveries} active now`,
      color: 'bg-gradient-to-br from-blue-50 to-blue-100',
      accentColor: 'bg-blue-500',
      progress,
      change: stats.completedToday > 0 ? `+${stats.completedToday} today` : 'No completions yet',
      changeType: stats.completedToday > 0 ? 'positive' : 'neutral',
      icon: Package,
    },
    {
      title: "Today's Earnings",
      value: stats.todayEarningsLabel,
      description: `${stats.completedToday} completed`,
      color: 'bg-gradient-to-br from-green-50 to-green-100',
      accentColor: 'bg-green-500',
      progress: stats.todayEarningsValue ? 80 : 0,
      change: stats.todayEarningsValue ? 'Earnings recorded' : 'Awaiting data',
      changeType: stats.todayEarningsValue ? 'positive' : 'neutral',
      showMini: true,
      icon: Banknote,
    },
    {
      title: 'Driver Rating',
      value: stats.ratingLabel,
      description: 'Feedback from recipients',
      color: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      accentColor: 'bg-yellow-500',
      progress: stats.ratingValue != null ? Math.min(100, (stats.ratingValue / 5) * 100) : 0,
      change: stats.ratingValue != null ? 'Great work!' : 'No rating available',
      changeType: stats.ratingValue != null ? 'positive' : 'neutral',
      icon: Star,
    },
    {
      title: 'Upcoming Job',
      value: stats.nextDeliveryLabel,
      description: `${stats.activeDeliveries} jobs queued`,
      color: 'bg-gradient-to-br from-purple-50 to-purple-100',
      accentColor: 'bg-purple-500',
      progress: 0,
      change: stats.nextDeliveryLabel === 'pending' ? 'Awaiting schedule' : '',
      changeType: 'neutral',
      icon: Clock,
    },
  ]
})

</script>
