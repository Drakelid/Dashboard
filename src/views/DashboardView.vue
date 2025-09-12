<template>
  <section class="space-y-6 pb-10">
    <!-- Welcome / Summary Banner -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-green-700 to-green-800 p-6 text-white">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold mb-1">Good afternoon, John! 🌱</h1>
          <p class="text-green-100 text-sm md:text-base">
            You have {{ quickStats.activeDeliveries }} active deliveries. Next pickup in {{ quickStats.nextDelivery }}.
          </p>
          <div class="flex items-center flex-wrap gap-3 mt-3 text-sm">
            <span class="px-2 py-1 rounded-lg bg-white/20 border border-white/30">Eco Score: <b>{{ quickStats.ecoScore }}%</b></span>
            <span class="opacity-90">Today: <b>{{ quickStats.todayEarnings }}</b></span>
            <span class="opacity-90">Standard fee: <b>{{ quickStats.deliveryFee }}</b></span>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 inline-flex items-center gap-2">
            <Map class="w-4 h-4" />
            <span>View Route</span>
          </button>
          <button class="px-3 py-2 rounded-lg bg-white text-green-700 hover:bg-green-50 inline-flex items-center gap-2">
            <Play class="w-4 h-4" />
            <span>Start Next</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <OverviewCards />

    <!-- Tabs -->
    <div class="space-y-6">
      <!-- Tabs List -->
      <div class="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
        <button 
          @click="tab = 'overview'" 
          :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', tab === 'overview' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900']"
        >
          Overview
        </button>
        <button 
          @click="tab = 'analytics'" 
          :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', tab === 'analytics' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900']"
        >
          Analytics
        </button>
        <button 
          @click="tab = 'tasks'" 
          :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', tab === 'tasks' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900']"
        >
          Tasks
        </button>
        <button 
          @click="tab = 'achievements'" 
          :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', tab === 'achievements' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900']"
        >
          Achievements
        </button>
      </div>

      <!-- Overview -->
      <div v-if="tab === 'overview'" class="space-y-6">
        <!-- Main Grid -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Active Deliveries -->
          <div class="lg:col-span-2 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <span class="inline-block h-5 w-5 rounded-full bg-blue-100 ring-2 ring-blue-200 grid place-items-center text-blue-600">
                  <Info class="w-3.5 h-3.5" />
                </span>
                Active Eco-Deliveries
              </h3>
            </div>
            <p class="text-sm text-gray-600">3 active deliveries • 75 kr standard fee • 2 eco-friendly</p>
            <div class="space-y-3">
              <div
                v-for="(task, index) in upcomingTasks"
                :key="task.id"
                class="p-4 rounded-lg border transition-shadow hover:shadow-sm"
                :class="getPriorityBg(task.priority)"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2 text-sm">
                    <span class="px-2 py-0.5 rounded bg-black/5 capitalize">{{ task.priority }}</span>
                    <span class="font-medium">{{ task.id }}</span>
                    <span class="text-gray-500">{{ task.type }}</span>
                    <span v-if="task.ecoFriendly" class="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">Eco</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <span class="font-medium text-green-600">{{ task.earnings }}</span>
                    <span class="font-medium">{{ task.time }}</span>
                  </div>
                </div>
                <div class="text-sm">
                  <div class="font-medium">{{ task.location }}</div>
                  <div class="text-gray-500">{{ task.address }}</div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="text-gray-500">{{ task.distance }}</div>
                    <button class="h-8 px-3 text-xs rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center gap-1.5">
                      <Navigation class="w-3.5 h-3.5" />
                      <span>Navigate</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Summary -->
          <aside class="space-y-4">
            <DeliveryHistory />
          </aside>
        </div>
      </div>

      <!-- Analytics -->
      <div v-if="tab === 'analytics'" class="space-y-6">
        <AnalyticsCharts />
      </div>

      <!-- Tasks -->
      <div v-if="tab === 'tasks'" class="space-y-6">
        <div class="rounded-xl border bg-white p-4 shadow-sm">
          <div class="font-semibold mb-3">Upcoming Tasks</div>
          <div class="space-y-3">
            <div
              v-for="(task, index) in upcomingTasks"
              :key="task.id"
              class="p-4 rounded-lg border transition-shadow hover:shadow-sm"
              :class="getPriorityBg(task.priority)"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 text-sm">
                  <span class="px-2 py-0.5 rounded bg-black/5 capitalize">{{ task.priority }}</span>
                  <span class="font-medium">{{ task.id }}</span>
                  <span class="text-gray-500">{{ task.type }}</span>
                  <span v-if="task.ecoFriendly" class="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">Eco</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <span class="font-medium text-green-600">{{ task.earnings }}</span>
                  <span class="font-medium">{{ task.time }}</span>
                </div>
              </div>
              <div class="text-sm">
                <div class="font-medium">{{ task.location }}</div>
                <div class="text-gray-500">{{ task.address }}</div>
                <div class="flex items-center justify-between mt-2">
                  <div class="text-gray-500">{{ task.distance }}</div>
                  <button class="h-8 px-3 text-xs rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center gap-1.5">
                    <Navigation class="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div v-if="tab === 'achievements'">
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="(ach, i) in achievements"
            :key="ach.title"
            class="p-4 rounded-lg border bg-white"
            :class="ach.earned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <div class="font-medium">{{ ach.title }}</div>
                <div class="text-sm text-gray-500">{{ ach.description }}</div>
              </div>
              <div v-if="ach.earned" class="text-green-600 text-sm font-medium">Earned</div>
              <div v-else class="text-gray-500 text-sm font-medium">{{ ach.progress }}%</div>
            </div>
            <div v-if="!ach.earned" class="h-2 w-full rounded-full bg-gray-100">
              <div class="h-2 rounded-full bg-green-500" :style="{ width: (ach.progress || 0) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import OverviewCards from '@/components/OverviewCards.vue'
import AnalyticsCharts from '@/components/AnalyticsCharts.vue'
import DeliveryHistory from '@/components/DeliveryHistory.vue'
import { Info, Map, Navigation, Play } from 'lucide-vue-next'

type Priority = 'urgent' | 'express' | 'standard'

type Task = {
  id: string
  type: 'pickup' | 'delivery'
  location: string
  address: string
  time: string
  priority: Priority
  distance: string
  ecoFriendly: boolean
  earnings: string
}

type Achievement = {
  title: string
  description: string
  earned: boolean
  progress?: number
}

const tab = ref<'overview' | 'analytics' | 'tasks' | 'achievements'>('overview')

const quickStats = reactive({
  todayEarnings: '600 kr',
  activeDeliveries: 5,
  completedToday: 8,
  rating: 4.9,
  hoursWorked: '7.2h',
  nextDelivery: '12 min',
  weeklyGoal: 87,
  bonusEarned: 150.0,
  ecoScore: 92,
  deliveryFee: '75 kr',
})

const upcomingTasks: Task[] = [
  {
    id: 'SB-002',
    type: 'pickup',
    location: 'Eco-Mart Warehouse',
    address: '1234 Green Avenue',
    time: '2:30 PM',
    priority: 'urgent',
    distance: '0.8 km',
    ecoFriendly: true,
    earnings: '75 kr',
  },
  {
    id: 'SB-003',
    type: 'delivery',
    location: 'Emma Thompson',
    address: '888 Pine Road, Suburbs',
    time: '3:15 PM',
    priority: 'standard',
    distance: '4.7 km',
    ecoFriendly: false,
    earnings: '75 kr',
  },
  {
    id: 'SB-004',
    type: 'pickup',
    location: 'Sustainable Store',
    address: '333 Earth Street',
    time: '4:00 PM',
    priority: 'express',
    distance: '2.1 km',
    ecoFriendly: true,
    earnings: '75 kr',
  },
]

const achievements: Achievement[] = [
  { title: 'Eco Champion', description: '100% green deliveries this week', earned: true },
  { title: 'Speed Demon', description: 'Under 15min avg delivery', earned: true },
  { title: 'Customer Favorite', description: '50+ positive reviews', earned: false, progress: 78 },
  { title: 'Route Master', description: '95% on-time rate', earned: false, progress: 94 },
]

function getPriorityBg(priority: Priority) {
  switch (priority) {
    case 'urgent':
      return 'border-red-200 bg-red-50'
    case 'express':
      return 'border-orange-200 bg-orange-50'
    default:
      return 'border-blue-200 bg-blue-50'
  }
}
</script>
