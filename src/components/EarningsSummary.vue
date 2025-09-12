<template>
  <section class="rounded-xl border bg-white shadow-sm">
    <header class="p-6 border-b">
      <h3 class="text-lg font-semibold">Earnings Summary</h3>
    </header>
    <div class="p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div><div class="font-bold text-2xl text-green-600">$247.80</div><div class="text-xs text-gray-500">Today</div></div>
        <div><div class="font-bold text-2xl">$1,523.40</div><div class="text-xs text-gray-500">This Week</div></div>
      </div>
      <div class="space-y-2 pt-3 border-t">
        <div class="flex justify-between text-sm"><span class="text-gray-500">Base Earnings</span><span class="font-medium">$195.40</span></div>
        <div class="flex justify-between text-sm"><span class="text-gray-500">Tips Received</span><span class="font-medium text-green-600">$52.40</span></div>
        <div class="flex justify-between text-sm"><span class="text-gray-500">Bonus (Express)</span><span class="font-medium text-blue-600">$12.00</span></div>
        <div class="flex justify-between text-sm border-t pt-2"><span class="font-medium">Total Today</span><span class="font-medium">$247.80</span></div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
</script>
