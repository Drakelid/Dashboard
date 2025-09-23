<template>
  <aside class="space-y-6">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-2">
      <img :src="logoSrc" alt="SamBring" class="h-16 w-auto" />
      <div>
        <div class="font-semibold">SamBring</div>
        <div class="text-xs text-green-700">Eco-Delivery Dashboard</div>
      </div>
    </div>

    <div v-for="section in navSections" :key="section.id">
      <div class="px-2 text-xs uppercase tracking-wide text-gray-500 mb-2">{{ section.title }}</div>
      <nav class="space-y-1">
        <RouterLink
          v-for="item in section.items"
          :key="item.path"
          :to="item.path"
          class="group tap-target flex items-center gap-3 rounded-xl px-3 py-2 border bg-white"
          :class="isActive(item.path)"
        >
          <span class="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 leading-none" :class="iconClass(item.path)">
            <component :is="item.icon" class="w-4 h-4 align-middle" />
          </span>
          <div class="flex-1">
            <div class="font-medium">{{ item.label }}</div>
            <div v-if="item.description" class="text-xs text-gray-500">{{ item.description }}</div>
          </div>
          <span
            v-if="badgeValue(item) !== null"
            class="ml-auto inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full text-xs bg-green-100 text-green-700"
          >
            {{ badgeValue(item) }}
          </span>
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
import { navSections as navigationSections, type NavItem } from '@/constants/navigation'

const route = useRoute()

const navSections = navigationSections

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

function badgeValue(item: NavItem) {
  if (!item.badge || item.badge.type === 'none') return null
  if (item.badge.type === 'static') return item.badge.value
  if (item.badge.type === 'jobsTotal') {
    return totalCount.value > 0 ? totalCount.value : null
  }
  return null
}
</script>
