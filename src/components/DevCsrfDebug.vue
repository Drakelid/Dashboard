<template>
  <div v-if="isDev" class="mt-6 rounded-lg border bg-yellow-50 text-yellow-900 p-4">
    <div class="flex items-center justify-between">
      <h4 class="font-semibold">CSRF Debug (dev only)</h4>
      <button class="h-8 px-3 rounded border bg-white hover:bg-yellow-100" @click="refresh">Refresh</button>
    </div>
    <div class="mt-3 grid gap-2 text-sm">
      <div class="flex justify-between">
        <span>Has CSRF Cookie:</span>
        <span class="font-medium">{{ hasCookie ? 'Yes' : 'No' }}</span>
      </div>
      <div class="flex justify-between">
        <span>Detected Token (by name):</span>
        <span class="font-mono">{{ tokenName || '—' }}</span>
      </div>
      <div class="flex justify-between">
        <span>Token value (first 12 chars):</span>
        <span class="font-mono">{{ tokenPreview }}</span>
      </div>
      <div>
        <span class="block mb-1">document.cookie:</span>
        <code class="block max-w-full overflow-x-auto p-2 bg-yellow-100 rounded">{{ cookieString || '—' }}</code>
      </div>
    </div>
    <div class="mt-3 flex gap-2">
      <button class="h-8 px-3 rounded border bg-white hover:bg-yellow-100" @click="prime">Prime CSRF</button>
      <button class="h-8 px-3 rounded border bg-white hover:bg-yellow-100" @click="openCsrfEndpoints">Open CSRF endpoints</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { hasCsrfCookie, getCsrfTokenValue, primeCsrf } from '@/api/http'

const isDev = import.meta.env.DEV

const hasCookie = ref<boolean>(false)
const tokenName = ref<string | null>(null)
const tokenValue = ref<string | null>(null)
const cookieString = ref<string>('')

function detectTokenName(): string | null {
  const names = ['csrftoken','csrf','csrf_token','XSRF-TOKEN','xsrf-token','XSRFToken','X_CSRF_TOKEN','CSRF-TOKEN']
  for (const n of names) {
    if (document.cookie.split('; ').some(c => c.startsWith(n + '='))) return n
  }
  return null
}

function refresh() {
  hasCookie.value = hasCsrfCookie()
  tokenName.value = detectTokenName()
  tokenValue.value = getCsrfTokenValue()
  cookieString.value = document.cookie
}

async function prime() {
  await primeCsrf().catch(() => {})
  refresh()
}

function openCsrfEndpoints() {
  const endpoints = ['/api/auth/csrf/','/api/csrf/','/dashboard/api/csrf/','/dashboard/api/auth/csrf/','/sanctum/csrf-cookie','/api/']
  endpoints.forEach(p => window.open(p, '_blank'))
}

const tokenPreview = computed(() => tokenValue.value ? tokenValue.value.slice(0, 12) + '…' : '—')

refresh()
</script>
