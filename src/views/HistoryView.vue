<template>
  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Delivery History</h2>
    <ActiveDeliveriesFromApi
      title="Past Deliveries"
      emptyText="No past deliveries"
      :items="past || []"
      :loading="deliveriesLoading"
      :error="deliveriesError"
      :showFullView="true"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ActiveDeliveriesFromApi from '@/components/ActiveDeliveriesFromApi.vue'
import { useDriverDeliveries } from '@/composables/useDriverDeliveries'

const { past, loading: deliveriesLoading, error: deliveriesError, loadPast } = useDriverDeliveries()

onMounted(() => {
  loadPast()
})
</script>
