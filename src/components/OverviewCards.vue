<template>
  <section class="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
    <div
      v-for="(stat, index) in stats"
      :key="stat.title"
      class="relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <!-- Background gradient -->
      <div :class="['absolute inset-0', stat.color]" />

      <!-- Accent line -->
      <div :class="['absolute top-0 left-0 right-0 h-1', stat.accentColor]" />

      <!-- Progress indicator -->
      <div
        class="absolute bottom-0 left-0 h-0.5 transition-all duration-700"
        :class="stat.accentColor"
        :style="{ width: stat.progress + '%' }"
      />

      <div class="relative z-10 p-4 space-y-2">
        <div class="flex items-center justify-between">
          <div class="text-xs md:text-sm font-medium text-gray-600 leading-tight line-clamp-2">
            {{ stat.title }}
          </div>
          <div class="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
            <component :is="icons[index]" class="w-4 h-4 text-gray-700" aria-hidden="true" />
          </div>
        </div>

        <div class="flex items-end gap-2">
          <div class="text-lg md:text-2xl font-bold leading-none">{{ stat.value }}</div>
          <div v-if="stat.showMini" class="flex-1">
            <div class="h-4 w-full rounded bg-black/5 overflow-hidden">
              <div
                class="h-4 bg-black/10"
                :style="{ width: (stat.progress || 0) + '%' }"
              />
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-600 line-clamp-1">
          {{ stat.description }}
        </p>

        <div class="flex items-center justify-between pt-1">
          <div class="text-xs font-medium" :class="getChangeColor(stat.changeType)">
            {{ stat.change }}
          </div>
          <button class="h-7 px-2 rounded border text-xs bg-white/90 hover:bg-white">Quick</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Package, Banknote, Star, Clock, MapPin, TrendingUp, Medal, DollarSign } from 'lucide-vue-next'

type ChangeType = 'positive' | 'negative' | 'neutral'

interface Stat {
  title: string
  value: string
  description: string
  color: string
  accentColor: string
  progress: number
  change: string
  changeType: ChangeType
  showMini?: boolean
}

const stats = reactive<Stat[]>([
  {
    title: "Today's Deliveries",
    value: '8',
    description: '5 pending pickup',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100',
    accentColor: 'bg-blue-500',
    progress: 75,
    change: '+3 from yesterday',
    changeType: 'positive',
  },
  {
    title: "Today's Earnings",
    value: '600 kr',
    description: '8 × 75 kr standard fee',
    color: 'bg-gradient-to-br from-green-50 to-green-100',
    accentColor: 'bg-green-500',
    progress: 82,
    change: '+3 deliveries',
    changeType: 'positive',
    showMini: true,
  },
  {
    title: 'Driver Rating',
    value: '4.9',
    description: 'Based on 156 reviews',
    color: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    accentColor: 'bg-yellow-500',
    progress: 98,
    change: '+0.1 this week',
    changeType: 'positive',
  },
  {
    title: 'Active Hours',
    value: '7.2h',
    description: 'Target: 8h today',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100',
    accentColor: 'bg-purple-500',
    progress: 90,
    change: '90% of target',
    changeType: 'neutral',
  },
  // Second row
  {
    title: 'SB-002',
    value: 'SB-002',
    description: 'Start Next Delivery · Ready for pickup',
    color: 'bg-gradient-to-br from-green-50 to-green-100',
    accentColor: 'bg-green-500',
    progress: 0,
    change: '',
    changeType: 'neutral',
  },
  {
    title: 'Weekly Goal',
    value: '87%',
    description: '65/75 deliveries',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100',
    accentColor: 'bg-blue-500',
    progress: 87,
    change: '',
    changeType: 'neutral',
    showMini: true,
  },
  {
    title: 'Performance Bonus',
    value: '+150 kr',
    description: 'Eco-friendly bonus this week',
    color: 'bg-gradient-to-br from-amber-50 to-amber-100',
    accentColor: 'bg-amber-500',
    progress: 0,
    change: '',
    changeType: 'neutral',
  },
  {
    title: 'Standard Fee',
    value: '75 kr',
    description: 'Per delivery up to 5kg',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100',
    accentColor: 'bg-purple-500',
    progress: 0,
    change: '',
    changeType: 'neutral',
  },
])

const icons = [
  Package,
  Banknote,
  Star,
  Clock,
  MapPin,
  TrendingUp,
  Medal,
  DollarSign,
]

function getChangeColor(type: ChangeType) {
  switch (type) {
    case 'positive':
      return 'text-green-600'
    case 'negative':
      return 'text-red-600'
    default:
      return 'text-blue-600'
  }
}
</script>
