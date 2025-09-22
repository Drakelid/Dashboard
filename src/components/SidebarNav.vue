<template>
  <aside class="space-y-6">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-2">
      <img :src="logoSrc" alt="SamBring" class="h-20 w-auto" />
      <div>
        <div class="font-semibold">SamBring</div>
        <div class="text-xs text-green-700">Eco-Delivery Dashboard</div>
      </div>
    </div>

    <!-- Main Navigation -->
    <div>
      <div class="px-2 text-xs uppercase tracking-wide text-gray-500 mb-2">Main Navigation</div>
      <nav class="space-y-1">
        <RouterLink :to="'/'" class="group tap-target flex items-center gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/')">
          <span class="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 leading-none" :class="iconClass('/')"><Home class="w-4 h-4 align-middle" /></span>
          <div class="flex-1">
            <div class="font-medium">Dashboard</div>
            <div class="text-xs text-gray-500">Overview & performance</div>
          </div>
        </RouterLink>
        <RouterLink :to="'/active'" class="group tap-target flex items-center gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/active')">
          <span class="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 leading-none" :class="iconClass('/active')"><Truck class="w-4 h-4 align-middle" /></span>
          <div class="flex-1">
            <div class="font-medium">Jobs & Nearby</div>
            <div class="text-xs text-gray-500">Your jobs and nearby pickups</div>
          </div>
          <span v-if="totalCount > 0" class="ml-auto inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full text-xs bg-green-100 text-green-700">{{ totalCount }}</span>
        </RouterLink>
        <RouterLink :to="'/messages'" class="group tap-target flex items-center gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/messages')">
          <span class="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 leading-none" :class="iconClass('/messages')"><MessageSquare class="w-4 h-4 align-middle" /></span>
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
        <RouterLink :to="'/history'" class="group tap-target flex items-center gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/history')">
          <span class="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 leading-none" :class="iconClass('/history')"><History class="w-4 h-4 align-middle" /></span>
          <div class="flex-1">
            <div class="font-medium">History</div>
            <div class="text-xs text-gray-500">Past deliveries</div>
          </div>
        </RouterLink>
        <RouterLink :to="'/profile'" class="group tap-target flex items-center gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/profile')">
          <span class="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 leading-none" :class="iconClass('/profile')"><User class="w-4 h-4 align-middle" /></span>
          <div class="flex-1">
            <div class="font-medium">Profile</div>
            <div class="text-xs text-gray-500">Your driver profile</div>
          </div>
        </RouterLink>
        <RouterLink :to="'/support'" class="group tap-target flex items-center gap-3 rounded-xl px-3 py-2 border bg-white" :class="isActive('/support')">
          <span class="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 leading-none" :class="iconClass('/support')"><HelpCircle class="w-4 h-4 align-middle" /></span>
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
import { computed } from 'vue'
import { counters } from '@/stores/counters'
import { Home, Truck, MessageSquare, History, User, HelpCircle } from 'lucide-vue-next'
const route = useRoute()
function isActive(path: string) {
  const active = path === '/' ? route.path === '/' : (route.path === path || route.path.startsWith(path + '/'))
  return active ? 'bg-green-600/10 ring-2 ring-green-300 text-green-800' : 'hover:bg-gray-50'
}

function iconClass(path: string) {
  const active = path === '/' ? route.path === '/' : (route.path === path || route.path.startsWith(path + '/'))
  return active
    ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
    : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200 group-hover:text-gray-900'
}

const logoSrc = new URL('../../logo.png', import.meta.url).href

const totalCount = computed(() => (counters.jobs || 0) + (counters.nearby || 0))
</script>
