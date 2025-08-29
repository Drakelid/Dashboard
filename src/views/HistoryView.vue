<template>
  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Delivery History</h2>
    <DeliveryHistory :showFullView="true" />
  </section>
</template>

<script setup lang="ts">
import DeliveryHistory from '@/components/DeliveryHistory.vue'
</script>
