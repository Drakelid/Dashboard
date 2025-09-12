<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20">
    <div class="flex">
      <!-- Sidebar -->
      <aside class="hidden lg:block w-72 px-4 py-6 border-r bg-white/90 backdrop-blur">
        <SidebarNav />
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 min-w-0">
        <!-- Content Header -->
        <header class="sticky top-0 z-40 glass-effect border-b border-gray-200/60">
          <div class="flex h-16 items-center justify-between px-4 md:px-6 gap-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span>SamBring</span>
              <span class="opacity-50">›</span>
              <span class="font-medium text-gray-900">Dashboard</span>
            </div>
            <div class="flex items-center gap-3 flex-1 md:flex-none md:w-[520px]">
              <div class="flex-1">
                <div class="relative">
                  <input class="w-full h-9 pl-3 pr-10 rounded-lg border bg-white placeholder:text-gray-400 text-sm"
                         placeholder="Search deliveries, customers… (⌘K)" />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">⌘K</span>
                </div>
              </div>
              <div class="hidden md:flex items-center gap-2">
                <span class="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">Online</span>
                <button class="relative h-9 w-9 rounded-full border bg-white hover:bg-gray-50">
                  <Bell class="w-4 h-4 text-gray-700" />
                  <span class="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-xs grid place-items-center">3</span>
                </button>
                <div class="h-9 w-9 rounded-full bg-gray-200 grid place-items-center text-sm font-medium">J</div>
              </div>
            </div>
          </div>
        </header>

        <main class="p-4 md:p-6">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarNav from '@/components/SidebarNav.vue'
import { Bell } from 'lucide-vue-next'
</script>

<style scoped>
.glass-effect {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
}
</style>
