<template>
  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Earnings</h2>
    <div class="grid gap-4 lg:grid-cols-2">
      <EarningsSummary />
      <DeliveryHistory />
    </div>
  </section>
</template>

<script setup lang="ts">
import EarningsSummary from '@/components/EarningsSummary.vue'
import DeliveryHistory from '@/components/DeliveryHistory.vue'
</script>
