<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h2 class="text-2xl font-semibold">Assignments</h2>
      <p class="text-sm text-gray-600">Review and manage your upcoming delivery assignments.</p>
    </header>

    <ActiveDeliveriesFromApi
      :items="futureDeliveries"
      :loading="deliveriesLoading"
      :error="deliveriesError"
      :showFullView="true"
      :enableActions="true"
      title="Your Assignments"
      empty-text="No assignments available right now."
      @refresh="refresh"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ActiveDeliveriesFromApi from '@/components/ActiveDeliveriesFromApi.vue'
import { useDriverDeliveries } from '@/composables/useDriverDeliveries'

const { future, loading: deliveriesLoading, error: deliveriesError, loadFuture, refresh } = useDriverDeliveries()

onMounted(() => {
  if (!future.value) {
    loadFuture().catch(() => {})
  }
})

const futureDeliveries = computed(() => future.value || [])
</script>
