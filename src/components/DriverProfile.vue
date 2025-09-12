<template>
  <div class="grid gap-6 lg:grid-cols-3">
    <!-- Profile Card -->
    <section class="rounded-xl border bg-white shadow-sm">
      <header class="p-6 border-b text-center space-y-2">
        <div class="h-24 w-24 mx-auto rounded-full overflow-hidden ring-2 ring-green-200">
          <img class="h-full w-full object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="Avatar" />
        </div>
        <h3 class="text-lg font-semibold">John Doe</h3>
        <p class="text-sm text-gray-500">Driver ID: PKG-DRV-2024-001</p>
      </header>
      <div class="p-6 space-y-4">
        <div class="text-center">
          <span class="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">Active • Online</span>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between text-sm"><span class="text-gray-500">Member since</span><span class="font-medium">January 2024</span></div>
          <div class="flex justify-between text-sm"><span class="text-gray-500">Vehicle Type</span><span class="font-medium">Cargo Van</span></div>
          <div class="flex justify-between text-sm"><span class="text-gray-500">License Plate</span><span class="font-medium">PKG-123</span></div>
          <div class="flex justify-between text-sm"><span class="text-gray-500">Coverage Zone</span><span class="font-medium">Downtown & Suburbs</span></div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 h-9 px-3 rounded border bg-white hover:bg-gray-50">Update Profile</button>
          <button class="h-9 w-9 rounded border bg-white hover:bg-gray-50 grid place-items-center" aria-label="Vehicle">
            <Truck class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>

    <!-- Performance Card -->
    <section class="rounded-xl border bg-white shadow-sm">
      <header class="p-6 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2"><Star class="w-4 h-4 text-yellow-500" aria-hidden="true" /> Performance Metrics</h3>
      </header>
      <div class="p-6 space-y-4">
        <div>
          <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Customer Rating</span><span class="font-medium">4.9/5.0</span></div>
          <div class="h-2 bg-gray-100 rounded"><div class="h-2 bg-yellow-400 rounded" style="width: 98%"></div></div>
          <p class="text-xs text-gray-500 mt-1">Based on 156 reviews this month</p>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Delivery Success Rate</span><span class="font-medium">99.2%</span></div>
          <div class="h-2 bg-gray-100 rounded"><div class="h-2 bg-green-500 rounded" style="width: 99.2%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">On-Time Delivery</span><span class="font-medium">96.8%</span></div>
          <div class="h-2 bg-gray-100 rounded"><div class="h-2 bg-blue-500 rounded" style="width: 96.8%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Package Handling Score</span><span class="font-medium">98.5%</span></div>
          <div class="h-2 bg-gray-100 rounded"><div class="h-2 bg-indigo-500 rounded" style="width: 98.5%"></div></div>
        </div>
        <div class="grid grid-cols-2 gap-4 pt-3 border-t">
          <div class="text-center"><div class="font-bold text-lg">847</div><div class="text-xs text-gray-500">Total Packages</div></div>
          <div class="text-center"><div class="font-bold text-lg">18.3</div><div class="text-xs text-gray-500">Daily Average</div></div>
        </div>
        <div class="flex items-center gap-2 pt-2"><span class="inline-block h-4 w-4 rounded-full bg-blue-500"></span><span class="px-2 py-0.5 border rounded text-xs">Verified Driver</span></div>
      </div>
    </section>

    <!-- Earnings Card -->
    <section class="rounded-xl border bg-white shadow-sm">
      <header class="p-6 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2"><TrendingUp class="w-4 h-4" aria-hidden="true" /> Earnings Summary</h3>
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
        <div class="space-y-2 pt-2">
          <div class="flex items-center gap-2"><span class="inline-block h-4 w-4 rounded-full bg-yellow-400"></span><span class="px-2 py-0.5 border rounded text-xs">Top 10% Performer</span></div>
          <div class="flex items-center gap-2"><span class="inline-block h-4 w-4 rounded-full bg-blue-500"></span><span class="px-2 py-0.5 border rounded text-xs">Express Certified</span></div>
        </div>
        <button class="w-full h-9 rounded border bg-white hover:bg-gray-50 flex items-center justify-center gap-2">
          <Clock class="w-4 h-4" aria-hidden="true" />
          <span>View Detailed Report</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Truck, Star, TrendingUp, Clock } from 'lucide-vue-next'
</script>
