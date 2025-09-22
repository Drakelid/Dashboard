<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h2 class="text-2xl font-semibold">Support</h2>
      <p class="text-sm text-gray-600">Assist customers with new delivery bookings, confirmations, and status lookups.</p>
    </header>
    <CustomerCommunication
      delivery-id="SB-002"
      customer-name="Michael Chen"
      customer-phone="+47 987 65 432"
    />
  </section>
</template>

<script setup lang="ts">
import CustomerCommunication from '@/components/CustomerCommunication.vue'
</script>
