<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h2 class="text-2xl font-semibold">Delivery API Explorer</h2>
      <p class="text-sm text-gray-600">This view mirrors the support tooling and is handy for QA when validating the public delivery endpoints.</p>
    </header>
    <DeliverySupportTools />
  </section>
</template>

<script setup lang="ts">
import DeliverySupportTools from '@/components/DeliverySupportTools.vue'
</script>
