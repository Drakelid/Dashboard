<template>
  <aside class="space-y-6">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-2">
      <div class="h-10 w-10 rounded-full bg-green-100 grid place-items-center">🌱</div>
      <div>
        <div class="font-semibold">SamBring</div>
        <div class="text-xs text-green-700">Eco-Delivery Dashboard</div>
      </div>
    </div>

    <!-- Main Navigation -->
    <div>
      <div class="px-2 text-xs uppercase tracking-wide text-gray-500 mb-2">Main Navigation</div>
      <nav class="space-y-1">
        <RouterLink :to="'/'" class="flex items-start gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/')">
          <span class="h-8 w-8 rounded-lg grid place-items-center bg-gray-100"><Home class="w-4 h-4 text-gray-700" /></span>
          <div class="flex-1">
            <div class="font-medium">Dashboard</div>
            <div class="text-xs text-gray-500">Overview & performance</div>
          </div>
        </RouterLink>
        <RouterLink :to="'/active'" class="flex items-start gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/active')">
          <span class="h-8 w-8 rounded-lg grid place-items-center bg-gray-100"><Truck class="w-4 h-4 text-gray-700" /></span>
          <div class="flex-1">
            <div class="font-medium">Active Deliveries</div>
            <div class="text-xs text-gray-500">Current deliveries</div>
          </div>
          <span class="ml-auto inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full text-xs bg-green-100 text-green-700">5</span>
        </RouterLink>
        <RouterLink :to="'/route'" class="flex items-start gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/route')">
          <span class="h-8 w-8 rounded-lg grid place-items-center bg-gray-100"><Map class="w-4 h-4 text-gray-700" /></span>
          <div class="flex-1">
            <div class="font-medium">Route Planning</div>
            <div class="text-xs text-gray-500">Optimize your routes</div>
          </div>
        </RouterLink>
        <RouterLink :to="'/messages'" class="flex items-start gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/messages')">
          <span class="h-8 w-8 rounded-lg grid place-items-center bg-gray-100"><MessageSquare class="w-4 h-4 text-gray-700" /></span>
          <div class="flex-1">
            <div class="font-medium">Messages</div>
            <div class="text-xs text-gray-500">Customer communications</div>
          </div>
          <span class="ml-auto inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full text-xs bg-green-100 text-green-700">3</span>
        </RouterLink>
      </nav>
    </div>

    <!-- Data & Settings -->
    <div>
      <div class="px-2 text-xs uppercase tracking-wide text-gray-500 mb-2">Data & Settings</div>
      <nav class="space-y-1">
        <RouterLink :to="'/history'" class="flex items-start gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/history')">
          <span class="h-8 w-8 rounded-lg grid place-items-center bg-gray-100"><History class="w-4 h-4 text-gray-700" /></span>
          <div class="flex-1">
            <div class="font-medium">History</div>
            <div class="text-xs text-gray-500">Past deliveries</div>
          </div>
        </RouterLink>
        <RouterLink :to="'/earnings'" class="flex items-start gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/earnings')">
          <span class="h-8 w-8 rounded-lg grid place-items-center bg-gray-100"><DollarSign class="w-4 h-4 text-gray-700" /></span>
          <div class="flex-1">
            <div class="font-medium">Earnings</div>
            <div class="text-xs text-gray-500">Income & performance</div>
          </div>
        </RouterLink>
        <RouterLink :to="'/profile'" class="flex items-start gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/profile')">
          <span class="h-8 w-8 rounded-lg grid place-items-center bg-gray-100"><User class="w-4 h-4 text-gray-700" /></span>
          <div class="flex-1">
            <div class="font-medium">Profile</div>
            <div class="text-xs text-gray-500">Your driver profile</div>
          </div>
        </RouterLink>
        <RouterLink :to="'/support'" class="flex items-start gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/support')">
          <span class="h-8 w-8 rounded-lg grid place-items-center bg-gray-100"><HelpCircle class="w-4 h-4 text-gray-700" /></span>
          <div class="flex-1">
            <div class="font-medium">Support</div>
            <div class="text-xs text-gray-500">Help & assistance</div>
          </div>
        </RouterLink>
      </nav>
    </div>

    <!-- Footer Card -->
    <div class="mt-auto p-3 rounded-xl border bg-gradient-to-br from-green-50 to-blue-50">
      <div class="text-sm font-medium">Settings</div>
      <div class="mt-2 flex items-center justify-between text-xs text-gray-600">
        <div>
          <div>SamBring Driver</div>
          <div class="text-gray-500">Eco-Delivery Edition</div>
        </div>
        <span class="px-2 py-1 rounded bg-white border text-gray-700">v2.1.0</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { Home, Truck, Map, MessageSquare, History, DollarSign, User, HelpCircle } from 'lucide-vue-next'
const route = useRoute()
function isActive(path: string) {
  return route.path === path ? 'bg-green-600/10 ring-2 ring-green-300 text-green-800' : 'hover:bg-gray-50'
}
</script>


