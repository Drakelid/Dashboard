<template>
  <section class="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
    <header class="p-4 border-b">
      <h3 class="text-lg font-semibold">Active Eco-Deliveries</h3>
      <p class="text-sm text-gray-500">
        {{ deliveries.length }} active deliveries • 75 kr standard fee •
        {{ deliveries.filter(d => d.ecoFriendly).length }} eco-friendly
      </p>
    </header>

    <div class="p-4 space-y-4">
      <div
        v-for="(delivery, index) in displayDeliveries"
        :key="delivery.id"
        class="border rounded-lg p-4 hover:shadow transition-all"
        :class="getPriorityColor(delivery.priority)"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium text-sm">{{ delivery.id }}</span>
            <span
              class="px-2 py-0.5 rounded text-xs font-medium"
              :class="getPriorityBadge(delivery.priority)"
            >
              {{ delivery.priority }}
            </span>
            <span
              class="px-2 py-0.5 rounded text-xs font-medium"
              :class="getStatusColor(delivery.status)"
            >
              {{ getStatusText(delivery.status) }}
            </span>
            <span v-if="delivery.ecoFriendly" class="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
              Eco
            </span>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium text-green-600">{{ delivery.earnings }}</div>
            <div class="text-xs text-gray-500">Standard fee</div>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 rounded-full bg-gray-300" />
            <div class="flex-1">
              <span class="font-medium text-sm">{{ delivery.customerName }}</span>
              <span class="text-xs text-gray-500 ml-2">
                {{ delivery.items }} item{{ delivery.items > 1 ? 's' : '' }} • {{ delivery.weight }}
              </span>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <div class="h-4 w-4 rounded-full bg-blue-400 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm">Pickup: {{ delivery.pickup.location }}</div>
              <div class="text-xs text-gray-500 line-clamp-1">{{ delivery.pickup.address }}</div>
              <div class="text-xs text-blue-600">{{ delivery.pickup.time }}</div>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <div class="h-4 w-4 rounded-full bg-green-500 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm">Delivery</div>
              <div class="text-xs text-gray-500 line-clamp-1">{{ delivery.dropoff.location }}</div>
              <div class="text-xs text-green-600">{{ delivery.dropoff.time }}</div>
            </div>
          </div>

          <div v-if="delivery.status === 'in_progress'" class="space-y-1">
            <div class="flex justify-between text-xs">
              <span>Progress</span>
              <span>{{ delivery.progress }}%</span>
            </div>
            <div class="h-2 w-full rounded bg-gray-100 overflow-hidden">
              <div class="h-2 bg-green-500" :style="{ width: delivery.progress + '%' }" />
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-3 border-t mt-3">
          <div class="flex gap-4 text-xs text-gray-600">
            <div class="flex items-center gap-1">
              <span class="inline-block h-3 w-3 rounded-full bg-gray-400" />
              {{ delivery.distance }}
            </div>
            <div class="flex items-center gap-1">
              <span class="inline-block h-3 w-3 rounded-full bg-gray-400" />
              {{ delivery.estimatedTime }}
            </div>
          </div>
          <div class="flex gap-2">
            <button class="h-8 px-3 rounded border text-xs bg-white hover:bg-gray-50">Call</button>
            <button class="h-8 px-3 rounded border text-xs bg-white hover:bg-gray-50">Message</button>
            <button class="h-8 px-3 rounded text-xs bg-green-600 text-white hover:bg-green-700">Navigate</button>
          </div>
        </div>
      </div>

      <div v-if="!showFullView && deliveries.length > 2" class="text-center pt-2">
        <button class="text-sm text-gray-600 hover:text-gray-900">View {{ deliveries.length - 2 }} more deliveries</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Stop {
  location: string
  address?: string
  time: string
}

interface Delivery {
  id: string
  customerName: string
  customerPhone: string
  pickup: Stop
  dropoff: Stop
  status: 'in_progress' | 'pending' | 'completed'
  priority: 'urgent' | 'express' | 'standard'
  distance: string
  estimatedTime: string
  earnings: string
  progress: number
  ecoFriendly: boolean
  items: number
  weight: string
}

const props = withDefaults(defineProps<{ showFullView?: boolean }>(), { showFullView: false })

const deliveries: Delivery[] = [
  {
    id: 'SB-002',
    customerName: 'Michael Chen',
    customerPhone: '+47 987 65 432',
    pickup: { location: 'Eco-Mart Warehouse', address: '1234 Green Avenue, Downtown', time: '2:30 PM' },
    dropoff: { location: '321 Oak Drive, Riverside', time: '3:15 PM' },
    status: 'in_progress',
    priority: 'urgent',
    distance: '4.7 km',
    estimatedTime: '12 min',
    earnings: '75 kr',
    progress: 65,
    ecoFriendly: true,
    items: 3,
    weight: '4.2kg',
  },
  {
    id: 'SB-003',
    customerName: 'Sarah Wilson',
    customerPhone: '+47 234 56 789',
    pickup: { location: 'Green Grocers', address: '456 Earth Street, Midtown', time: '3:45 PM' },
    dropoff: { location: '789 Pine Road, Suburbs', time: '4:30 PM' },
    status: 'pending',
    priority: 'standard',
    distance: '6.2 km',
    estimatedTime: '18 min',
    earnings: '75 kr',
    progress: 0,
    ecoFriendly: true,
    items: 2,
    weight: '3.8kg',
  },
  {
    id: 'SB-004',
    customerName: 'David Rodriguez',
    customerPhone: '+47 345 67 890',
    pickup: { location: 'Tech Store', address: '999 Innovation Ave', time: '5:00 PM' },
    dropoff: { location: '555 Maple Street, Downtown', time: '5:45 PM' },
    status: 'pending',
    priority: 'express',
    distance: '3.1 km',
    estimatedTime: '8 min',
    earnings: '75 kr',
    progress: 0,
    ecoFriendly: false,
    items: 1,
    weight: '2.1kg',
  },
]

const displayDeliveries = computed(() => (props.showFullView ? deliveries : deliveries.slice(0, 2)))

function getStatusColor(status: Delivery['status']) {
  switch (status) {
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-orange-100 text-orange-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status: Delivery['status']) {
  switch (status) {
    case 'in_progress':
      return 'In Progress'
    case 'pending':
      return 'Pending'
    case 'completed':
      return 'Completed'
    default:
      return 'Unknown'
  }
}

function getPriorityColor(priority: Delivery['priority']) {
  switch (priority) {
    case 'urgent':
      return 'border-red-200 bg-red-50'
    case 'express':
      return 'border-orange-200 bg-orange-50'
    default:
      return 'border-blue-200 bg-blue-50'
  }
}

function getPriorityBadge(priority: Delivery['priority']) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800'
    case 'express':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}
</script>
