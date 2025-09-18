<template>
  <section class="min-h-[100svh] flex flex-col lg:hidden">
    <!-- Header -->
    <header class="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
      <div class="h-14 px-4 flex items-center justify-between">
        <div class="text-sm font-semibold">Menu</div>
        <RouterLink :to="backTarget" class="h-8 w-8 tap-target grid place-items-center rounded hover:bg-gray-100" aria-label="Close menu">
          <X class="w-4 h-4" />
        </RouterLink>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <SidebarNav />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
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

// If opened on desktop widths, immediately redirect back
onMounted(() => {
  try {
    const mql = window.matchMedia('(min-width: 1024px)')
    if (mql.matches) {
      router.replace(backTarget.value)
      return
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) router.replace(backTarget.value)
    }
    mql.addEventListener?.('change', handler)
  } catch {}
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
