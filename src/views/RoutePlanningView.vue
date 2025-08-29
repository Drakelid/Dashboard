<template>
  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Route Planning</h2>
    <div class="grid gap-4 lg:grid-cols-2">
      <DeliveryMap />
      <RouteTracker />
    </div>
  </section>
</template>

<script setup lang="ts">
import DeliveryMap from '@/components/DeliveryMap.vue'
import RouteTracker from '@/components/RouteTracker.vue'
</script>
