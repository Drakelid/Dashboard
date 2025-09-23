<template>
  <section class="min-h-[100svh] flex flex-col lg:hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30">
    <!-- Header -->
    <header class="sticky top-0 z-10 border-b border-gray-200/70 bg-white/90 backdrop-blur-xl shadow-sm">
      <div class="h-14 px-4 flex items-center justify-between">
        <div class="text-sm font-semibold">Menu</div>
        <RouterLink :to="backTarget" class="h-8 w-8 tap-target grid place-items-center rounded hover:bg-gray-100" aria-label="Close menu">
          <X class="w-4 h-4" />
        </RouterLink>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div class="mx-auto w-full max-w-lg">
        <div class="rounded-2xl border border-gray-200/70 bg-white/85 backdrop-blur-xl shadow-sm px-3 py-4">
          <SidebarNav />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import SidebarNav from '@/components/SidebarNav.vue'

const route = useRoute()
const router = useRouter()
// If we came here from another page, back to it; otherwise default to '/'
const backTarget = computed(() => {
  const redirect = (route.query.redirect as string) || '/'
  if (redirect.startsWith('/menu')) return '/'
  return redirect
})

let mediaQuery: MediaQueryList | null = null
let mediaHandler: ((event: MediaQueryListEvent) => void) | null = null

// If opened on desktop widths, immediately redirect back
onMounted(() => {
  try {
    mediaQuery = window.matchMedia('(min-width: 1024px)')
    if (mediaQuery.matches) {
      router.replace(backTarget.value)
      return
    }
    mediaHandler = (event: MediaQueryListEvent) => {
      if (event.matches) router.replace(backTarget.value)
    }
    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', mediaHandler)
    else mediaQuery.addListener?.(mediaHandler)
  } catch {
    mediaQuery = null
    mediaHandler = null
  }
})

onUnmounted(() => {
  if (!mediaQuery || !mediaHandler) return
  if (mediaQuery.removeEventListener) mediaQuery.removeEventListener('change', mediaHandler)
  else mediaQuery.removeListener?.(mediaHandler)
  mediaQuery = null
  mediaHandler = null
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 3px;
}
</style>
