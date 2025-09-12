<template>
  <div class="px-4 py-2 text-xs flex items-center justify-between border-b bg-amber-50 text-amber-900" role="status">
    <div class="flex items-center gap-3">
      <span class="font-medium">Dev Auth Mode</span>
      <span class="px-2 py-0.5 rounded bg-white border">Mode: <strong>{{ mode }}</strong></span>
      <span class="px-2 py-0.5 rounded bg-white border">API Base: <code>{{ apiBase }}</code></span>
      <span v-if="userEmail" class="px-2 py-0.5 rounded bg-white border">User: <strong>{{ userEmail }}</strong></span>
    </div>
    <div class="flex items-center gap-2">
      <span v-if="mode === 'Cookie/Session'" class="text-amber-700">Session cookies will be used.</span>
      <span v-else-if="mode === 'Basic'" class="text-amber-700">Using HTTP Basic for all requests.</span>
      <span v-else class="text-amber-700">Authorization header will be attached to requests.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { API_BASE_URL, getDefaultAuthConfig } from '@/api/http'
import { useAuth } from '@/composables/useAuth'

const apiKey = (import.meta as any).env?.VITE_API_KEY as string | undefined
const { user } = useAuth()

const mode = computed(() => {
  if (apiKey) return 'API Key'
  const def = getDefaultAuthConfig()
  if (def?.basic) return 'Basic'
  return 'Cookie/Session'
})

const apiBase = computed(() => (API_BASE_URL || window.location.origin))
const userEmail = computed(() => user.value?.email || '')
</script>
