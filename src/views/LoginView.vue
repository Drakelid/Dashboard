<template>
  <section class="max-w-md mx-auto space-y-6">
    <h2 class="text-2xl font-semibold">Sign in</h2>

    <form v-if="!apiKey" class="space-y-4 rounded-xl border bg-white p-4 shadow-sm" @submit.prevent="onSubmit">
      <div class="space-y-1">
        <label class="text-sm font-medium">Email</label>
        <input v-model="email" type="email" required class="w-full h-10 px-3 rounded-lg border" placeholder="you@example.com" :disabled="loading" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Password</label>
        <input v-model="password" type="password" required class="w-full h-10 px-3 rounded-lg border" placeholder="••••••••" :disabled="loading" />
      </div>

      <!-- Login mode selector -->
      <div class="space-y-1">
        <label class="text-sm font-medium">Login mode</label>
        <div class="flex items-center gap-4 text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="radio" class="accent-green-600" value="cookie" v-model="mode" />
            <span>Cookie (Session)</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="radio" class="accent-green-600" value="basic" v-model="mode" />
            <span>Basic</span>
          </label>
        </div>
        <p class="text-xs text-gray-500" v-if="mode==='cookie'">Choose Cookie for session-based login (requires CSRF). If blocked, switch to Basic.</p>
        <p class="text-xs text-gray-500" v-else>Basic sends Authorization header on each request (no CSRF needed).</p>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex items-center justify-between">
        <button :disabled="loading" class="h-10 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
          <Spinner v-if="loading" size="sm" />
          <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
        </button>
        <button v-if="isDev && mode==='cookie'" type="button" class="text-xs text-gray-600 hover:underline" @click="openCsrfHelp">Login help (CSRF)</button>
      </div>
    </form>

    <!-- API key mode info -->
    <div v-else class="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
      <div class="text-sm">
        <p class="font-medium">API Key mode</p>
        <p class="text-gray-600">You're signed in using an API key. Redirecting…</p>
      </div>
      <button class="h-10 px-4 rounded-lg border bg-white hover:bg-gray-50" @click="goHome">Continue</button>
    </div>

    <div v-if="showHelp && !apiKey && mode==='cookie'" class="rounded-lg border p-3 bg-yellow-50 text-sm text-yellow-900">
      <p class="font-medium mb-2">Cookie login help</p>
      <ol class="list-decimal ml-5 space-y-1">
        <li>We tried to prime CSRF for you. If it still fails, click Prime CSRF below.</li>
        <li>Ensure the panel shows “Has CSRF Cookie: Yes”.</li>
        <li>Then submit the login form again.</li>
      </ol>
    </div>

    <div ref="csrfPanel">
      <DevCsrfDebug v-if="isDev && !apiKey && mode==='cookie'" />
    </div>

    <p class="text-sm text-gray-600">
      Don’t have an account? Contact your administrator.
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Spinner from '@/components/Spinner.vue'
import DevCsrfDebug from '@/components/DevCsrfDebug.vue'
import { primeCsrf } from '@/api/http'

const route = useRoute()
const router = useRouter()
const { login, loading, error, bootstrapFromApi } = useAuth()

const email = ref('')
const password = ref('')
const isDev = import.meta.env.DEV
const apiKey = (import.meta as any).env?.VITE_API_KEY
const showHelp = ref(false)
const csrfPanel = ref<HTMLElement | null>(null)

// Default mode from env: if VITE_LOGIN_BASIC_FIRST is true, start with 'basic', else 'cookie'
const defaultBasicFirst = ((import.meta as any).env?.VITE_LOGIN_BASIC_FIRST ?? '').toString().toLowerCase() === 'true' || ((import.meta as any).env?.VITE_LOGIN_BASIC_FIRST ?? '').toString() === '1'
const mode = ref<'cookie' | 'basic'>(defaultBasicFirst ? 'basic' : 'cookie')

function goHome() {
  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}

async function openCsrfHelp() {
  showHelp.value = true
  await primeCsrf().catch(() => {})
  await nextTick()
  csrfPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(async () => {
  if (apiKey) {
    await bootstrapFromApi().catch(() => {})
    goHome()
  }
})

async function onSubmit() {
  try {
    await login({ email: email.value, password: password.value }, { mode: mode.value })
    goHome()
  } catch (e) {
    // error state handled in composable
  }
}
</script>
