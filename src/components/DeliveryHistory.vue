<template>
  <section class="rounded-xl border bg-white shadow-sm">
    <header class="p-4 border-b">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <span class="inline-block h-4 w-4 rounded-full bg-green-500" />
        Delivery History
      </h3>
      <p class="text-sm text-gray-500">
        {{ showFullView ? 'All completed deliveries today' : 'Recent completed deliveries' }}
      </p>
    </header>

    <div class="p-4 space-y-3">
      <div v-for="delivery in displayedDeliveries" :key="delivery.id" class="border rounded-lg p-3 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="inline-block h-4 w-4 rounded-full bg-green-500" />
            <span class="font-medium text-sm">{{ delivery.id }}</span>
            <span class="px-2 py-0.5 rounded text-xs" :class="getPackageTypeColor(delivery.packageType)">
              {{ delivery.packageType }}
            </span>
          </div>
          <div class="text-sm font-medium text-green-600">
            +{{ (parseFloat(delivery.earnings.slice(1)) + parseFloat(delivery.tip.slice(1))).toFixed(2) }}
          </div>
        </div>

        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span>{{ delivery.sender }} → {{ delivery.customerName }}</span>
            <span class="text-gray-500">{{ delivery.deliveryTime }}</span>
          </div>

          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <span class="inline-block h-3 w-3 rounded-full bg-gray-400" />
                {{ delivery.duration }}
              </div>
              <div class="flex items-center gap-1">
                <span class="inline-block h-3 w-3 rounded-full bg-gray-400" />
                {{ delivery.weight }}
              </div>
              <div>{{ delivery.distance }}</div>
              <div class="flex items-center gap-0.5">
                <Star v-for="i in delivery.rating" :key="`f-${delivery.id}-${i}`" class="w-3 h-3 text-yellow-500" :fill="'currentColor'" />
                <Star v-for="i in 5 - delivery.rating" :key="`e-${delivery.id}-${i}`" class="w-3 h-3 text-gray-300" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span>Base: {{ delivery.earnings }}</span>
              <span>Tip: {{ delivery.tip }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!showFullView && recentDeliveries.length > 4" class="text-center pt-2">
        <span class="inline-block px-2 py-1 border rounded text-xs">
          +{{ recentDeliveries.length - 4 }} more deliveries
        </span>
      </div>

      <div class="pt-3 border-t">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500">{{ showFullView ? "Today's Total" : 'Shown Deliveries' }}</span>
          <div class="flex items-center gap-3">
            <span>{{ displayedDeliveries.length }} packages</span>
            <span class="font-medium text-green-600">${{ totalEarnings.toFixed(2) }} earned</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ showFullView?: boolean }>(), { showFullView: false })

type DeliveryItem = {
  id: string
  customerName: string
  sender: string
  deliveryTime: string
  packageType: string
  earnings: string
  tip: string
  rating: number
  distance: string
  duration: string
  weight: string
}

const recentDeliveries: DeliveryItem[] = [
  { id: 'PKG-087', customerName: 'Alex Thompson', sender: 'Tech Store', deliveryTime: '3:22 PM', packageType: 'Electronics', earnings: '$12.50', tip: '$5.00', rating: 5, distance: '2.1 km', duration: '16 min', weight: '1.8 kg' },
  { id: 'PKG-086', customerName: 'Maria Garcia', sender: 'Fashion Hub', deliveryTime: '2:45 PM', packageType: 'Clothing', earnings: '$8.75', tip: '$3.50', rating: 5, distance: '1.3 km', duration: '12 min', weight: '0.9 kg' },
  { id: 'PKG-085', customerName: 'Robert Kim', sender: 'Pharmacy Plus', deliveryTime: '2:10 PM', packageType: 'Medical', earnings: '$15.00', tip: '$8.00', rating: 5, distance: '3.2 km', duration: '22 min', weight: '0.3 kg' },
  { id: 'PKG-084', customerName: 'Jennifer Lee', sender: 'Home Depot', deliveryTime: '1:35 PM', packageType: 'Hardware', earnings: '$10.25', tip: '$4.75', rating: 4, distance: '2.8 km', duration: '19 min', weight: '5.2 kg' },
  { id: 'PKG-083', customerName: 'David Wilson', sender: 'Book Store', deliveryTime: '1:05 PM', packageType: 'Books', earnings: '$7.50', tip: '$2.50', rating: 5, distance: '1.6 km', duration: '14 min', weight: '1.1 kg' },
  { id: 'PKG-082', customerName: 'Lisa Chen', sender: 'Grocery Market', deliveryTime: '12:30 PM', packageType: 'Groceries', earnings: '$9.00', tip: '$6.00', rating: 5, distance: '2.5 km', duration: '18 min', weight: '3.4 kg' },
]

const displayedDeliveries = computed(() => (props.showFullView ? recentDeliveries : recentDeliveries.slice(0, 4)))
const totalEarnings = computed(() => displayedDeliveries.value.reduce((sum, d) => sum + parseFloat(d.earnings.slice(1)) + parseFloat(d.tip.slice(1)), 0))

function getPackageTypeColor(type: string) {
  const map: Record<string, string> = {
    Electronics: 'bg-blue-100 text-blue-800',
    Clothing: 'bg-purple-100 text-purple-800',
    Medical: 'bg-red-100 text-red-800',
    Hardware: 'bg-orange-100 text-orange-800',
    Books: 'bg-green-100 text-green-800',
    Groceries: 'bg-yellow-100 text-yellow-800',
  }
  return map[type] || 'bg-gray-100 text-gray-800'
}
</script>
