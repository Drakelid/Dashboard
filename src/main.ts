import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import './styles/map-overrides.css'
import { setUnauthorizedHandler, primeCsrf, setDefaultAuth } from '@/api/http'
import { useAuth } from '@/composables/useAuth'

// Global unauthorized -> clear and redirect to /login
setUnauthorizedHandler(() => {
  const { clear } = useAuth()
  clear()
  if (router.currentRoute.value.name !== 'login') {
    router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
  }
})

const apiKey = (import.meta as any).env?.VITE_API_KEY
const disableCsrfPrimeEnv = ((import.meta as any).env?.VITE_DISABLE_CSRF_PRIME ?? '').toString().toLowerCase() === 'true'
const isVercelHost = typeof window !== 'undefined' && window.location?.hostname.endsWith('.vercel.app')
const authMode = ((import.meta as any).env?.VITE_AUTH_MODE ?? '').toString().toLowerCase()
const preferApiKey = authMode === 'api-key'

async function preflightAuth() {
  // Attach Api-Key globally only when explicitly requested and not on Vercel
  if (apiKey && preferApiKey && !isVercelHost) setDefaultAuth({ apiKey })

  // Prime CSRF early to help cookie auth flows, but skip on Vercel or when using API key
  if (!apiKey && !disableCsrfPrimeEnv && !isVercelHost) {
    await primeCsrf().catch(() => {})
  }

  // If we're already on the login route, skip profile preflight to avoid 403 noise
  if (router.currentRoute.value.name === 'login') {
    return
  }

  // Validate session/API-key by attempting to fetch profile once
  const { bootstrapFromApi, clear } = useAuth()
  const u = await bootstrapFromApi().catch(() => null)
  if (!u) {
    // Ensure no stale session remains
    clear()
    // If not already on an allowlisted route, redirect to login
    const allow = ['/login', '/api-test']
    const cur = router.currentRoute.value.fullPath
    const isAllow = allow.some(p => cur === p || cur.startsWith(p + '/'))
    if (!isAllow) {
      router.replace({ name: 'login', query: { redirect: cur } })
    }
  }
}

// Mount app after one-time auth preflight completes
preflightAuth().finally(() => {
  createApp(App).use(router).mount('#app')
})
