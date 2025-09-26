<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20">
    <DevAuthModeBanner v-if="isDev" />
    <div class="flex">
      <!-- Sidebar -->
      <aside class="hidden lg:block w-72 px-4 py-6 border-r bg-white/90 backdrop-blur relative z-[300] pointer-events-auto">
        <SidebarNav />
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 min-w-0">
        <!-- Content Header -->
        <header class="sticky top-0 z-40 glass-effect border-b border-gray-200/60">
          <div class="flex h-16 items-center justify-between px-4 md:px-6 gap-4">
            <div class="flex items-center gap-3">
              <button type="button" @click="toggleMenuRoute" class="md:hidden relative h-11 w-11 tap-target rounded-full border border-gray-200 bg-white hover:bg-gray-50 leading-[0] p-0" aria-label="Toggle navigation menu">
                <Menu class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-gray-700" />
              </button>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <img :src="logoSrc" alt="SamBring" class="h-12 w-auto" />
                <span class="opacity-50">›</span>
                <span class="font-medium text-gray-900">{{ currentTitle }}</span>
              </div>
            </div>
            <div class="hidden md:flex items-center gap-2 ml-auto">
              <span class="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">Online</span>
              <button class="relative h-9 w-9 tap-target rounded-full border bg-white hover:bg-gray-50">
                <Bell class="w-4 h-4 text-gray-700" />
                <span class="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-xs grid place-items-center">3</span>
              </button>
              <div class="h-9 w-9 rounded-full bg-gray-200 grid place-items-center text-sm font-medium">J</div>
            </div>
          </div>
        </header>

        <main class="relative z-0 p-4 md:p-6 pb-24 lg:pb-6">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
  <!-- Mobile navigation drawer removed; use /menu route instead -->
  <CommandPalette
    v-model="isPaletteOpen"
    :commands="commandItems"
    :initial-query="paletteInitialQuery"
    @run="onCommandRun"
  />
  <ToastHost />
</template>
<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import SidebarNav from '@/components/SidebarNav.vue'
import { Bell, Menu } from 'lucide-vue-next'
import ToastHost from '@/components/ToastHost.vue'
import DevAuthModeBanner from '@/components/DevAuthModeBanner.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import { navSections } from '@/constants/navigation'
import type { CommandItem } from '@/types/command'
import { useDriverDeliveries } from '@/composables/useDriverDeliveries'
import type { DriverDeliveryItem } from '@/types/api'

const isDev = import.meta.env.DEV
const route = useRoute()
const router = useRouter()
const isPaletteOpen = ref(false)
const paletteInitialQuery = ref('')

const { future, refresh, loadFuture } = useDriverDeliveries()

const logoSrc = new URL('../logo.png', import.meta.url).href
// Toggle behavior for mobile hamburger: open /menu with redirect when closed,
// and go back to redirect (or '/') when already on /menu. Replace when closing
// to avoid stacking history entries.
function toggleMenuRoute() {
  if (route.path.startsWith('/menu')) {
    const redirect = (route.query.redirect as string) || '/'
    const target = redirect.startsWith('/menu') ? '/' : redirect
    router.replace(target)
  } else {
    router.push({ name: 'menu', query: { redirect: route.fullPath } })
  }
}

function openPalette(initial = '') {
  paletteInitialQuery.value = initial
  isPaletteOpen.value = true
}

function handleGlobalShortcut(event: KeyboardEvent) {
  const isModifier = event.metaKey || event.ctrlKey
  if (isModifier && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openPalette('')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalShortcut)
})

watch(isPaletteOpen, value => {
  if (value) {
    if (!future.value) {
      loadFuture().catch(() => {})
    }
  } else {
    paletteInitialQuery.value = ''
  }
})

const routeCommands = computed<CommandItem[]>(() =>
  navSections.flatMap(section =>
    section.items.map(item => ({
      id: `route:${item.path}`,
      title: item.label,
      subtitle: item.description,
      group: 'Navigate',
      keywords: [item.path, item.label, item.description || ''].filter(Boolean),
      run: () => router.push(item.path),
    }))
  )
)

function deliverySubtitle(item: DriverDeliveryItem) {
  const pickup = item.pickup_location || item.delivery?.pickup_location || 'Pickup pending'
  const dropoff = item.delivery?.delivery_location || item.location || 'Destination pending'
  return `${pickup} → ${dropoff}`
}

const deliveryCommands = computed<CommandItem[]>(() => {
  const deliveries = future.value || []
  return deliveries.slice(0, 20).map(item => {
    const identifier = String(item.delivery?.id ?? (item.delivery as any)?.uuid ?? item.location ?? 'delivery')
    return {
      id: `delivery:${identifier}`,
      title: `View delivery #${identifier}`,
      subtitle: deliverySubtitle(item),
      group: 'Deliveries',
      keywords: [identifier, item.location || '', item.delivery?.delivery_location || ''],
      run: () => router.push({ name: 'active', query: { focus: identifier } }),
    }
  })
})

const actionCommands = computed<CommandItem[]>(() => [
  {
    id: 'action:refresh-deliveries',
    title: 'Refresh deliveries data',
    subtitle: 'Fetch latest upcoming and past deliveries',
    group: 'Actions',
    keywords: ['reload', 'update', 'jobs'],
    run: () => refresh(),
  },
  {
    id: 'action:view-support',
    title: 'Open Support',
    subtitle: 'Go to the support tools view',
    group: 'Actions',
    keywords: ['help', 'contact'],
    run: () => router.push({ name: 'support' }),
  },
])

const commandItems = computed<CommandItem[]>(() => [
  ...routeCommands.value,
  ...actionCommands.value,
  ...deliveryCommands.value,
])

function onCommandRun() {
  paletteInitialQuery.value = ''
}

// Bottom nav removed on mobile by design; use header menu to open the sidebar (/menu)

// Dynamic header title based on current route
const currentTitle = computed(() => {
  const p = route.path
  if (p === '/') return 'Dashboard'
  if (p.startsWith('/active')) return 'Jobs & Nearby'
  if (p.startsWith('/messages')) return 'Messages'
  if (p.startsWith('/history')) return 'History'
  if (p.startsWith('/profile')) return 'Profile'
  if (p.startsWith('/support')) return 'Support'
  if (p.startsWith('/menu')) return 'Menu'
  if (p.startsWith('/login')) return 'Login'
  return 'Dashboard'
})
</script>

<style scoped>
.glass-effect {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
}
</style>
