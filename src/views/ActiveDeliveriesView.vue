<template>
  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Active Deliveries</h2>
    <ActiveDeliveries :showFullView="true" />
    <!-- New Pickup Modal -->
    <NewPickupRequestModal
      v-model="showNewPickup"
      :request="currentRequest"
      @accept="handleAccept"
      @decline="handleDecline"
      @expired="handleExpired"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import ActiveDeliveries from '@/components/ActiveDeliveries.vue'
import NewPickupRequestModal from '@/components/NewPickupRequestModal.vue'
import type { NewPickupRequest } from '@/types/pickups'
import { addNewPickupListener, emitNewPickupRequest } from '@/utils/pickupEvents'

const showNewPickup = ref(false)
const currentRequest = ref<NewPickupRequest>({
  priority: 'standard',
  pickup: { name: '', address: '' },
  dropoff: { name: '', address: '' },
  etaMinutes: 0,
  distanceKm: 0,
  dimensions: '',
  weightKg: 0,
  volumeL: 0,
  feeKr: 0,
  expiresInSeconds: 0,
})

const removeListener = addNewPickupListener((req) => {
  currentRequest.value = req
  showNewPickup.value = true
})

onUnmounted(() => removeListener())

// Dev-time demo trigger
onMounted(() => {
  if (import.meta.env.DEV) {
    setTimeout(() => {
      emitNewPickupRequest({
        priority: 'standard',
        pickup: { name: 'Kiwi Majorstuen', address: 'Bogstadveien 55, 0366 Oslo' },
        dropoff: { name: 'Sofia Hansen', address: 'Storgata 28, 0184 Oslo' },
        etaMinutes: 11,
        distanceKm: 1.0,
        dimensions: '29 × 20 × 11 cm',
        weightKg: 2.2,
        volumeL: 6.4,
        feeKr: 75,
        expiresInSeconds: 150, // 2:30
      })
    }, 600)
  }
})

function handleAccept(req: NewPickupRequest) {
  // TODO: Assign to driver and refresh list
  console.log('Accepted pickup', req)
}
function handleDecline(req: NewPickupRequest) {
  console.log('Declined pickup', req)
}
function handleExpired(req: NewPickupRequest) {
  console.log('Pickup expired', req)
}
</script>
