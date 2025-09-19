import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout, signup as apiSignup, changePassword as apiChangePassword } from '@/api/auth'
import type { ChangePasswordRequest, LoginRequest, SignupRequest, User, Driver } from '@/types/api'
import { setDefaultAuth, primeCsrf } from '@/api/http'
import { getProfile as apiGetProfile } from '@/api/driver'

const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const STORAGE_KEY = 'sambring:user'

function loadFromSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) user.value = JSON.parse(raw) as User
  } catch (e) {
    // ignore
  }
}

function saveToSession() {
  try {
    if (user.value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
  } catch (e) {
    // ignore
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    // ignore
  }
}

loadFromSession()

const allowBasicFallback = ((import.meta as any).env?.VITE_ALLOW_BASIC ?? '').toString().toLowerCase() === 'true' || ((import.meta as any).env?.VITE_ALLOW_BASIC ?? '').toString() === '1'
const loginBasicFirst = ((import.meta as any).env?.VITE_LOGIN_BASIC_FIRST ?? '').toString().toLowerCase() === 'true' || ((import.meta as any).env?.VITE_LOGIN_BASIC_FIRST ?? '').toString() === '1'
const authMode = ((import.meta as any).env?.VITE_AUTH_MODE ?? '').toString().toLowerCase()
const isVercelHost = typeof window !== 'undefined' && window.location?.hostname.endsWith('.vercel.app')
const preferApiKey = authMode === 'api-key'
const forceCookie = authMode === 'cookie' || isVercelHost

async function bootstrapFromApi(): Promise<User | null> {
  try {
    const driver: Driver = await apiGetProfile()
    const u = driver.user
    user.value = u
    saveToSession()
    return u
  } catch {
    return null
  }
}

async function login(payload: LoginRequest, opts?: { mode?: 'cookie' | 'basic' | 'auto' }) {
  const mode = opts?.mode || 'auto'
  loading.value = true
  error.value = null
  try {
    // Always force cookie mode on Vercel or when explicitly configured
    if (forceCookie) {
      await primeCsrf().catch(() => {})
      const u = await apiLogin(payload)
      setDefaultAuth(undefined)
      user.value = u
      saveToSession()
      return u
    }

    // If explicitly in API-key mode (and not forcing cookie), validate by fetching profile
    if (preferApiKey && !forceCookie) {
      const u = await bootstrapFromApi()
      if (!u) throw new Error('Invalid API key or insufficient permissions')
      return u
    }

    // Explicit Basic mode
    if (mode === 'basic') {
      const driver: Driver = await apiGetProfile({
        auth: { basic: { username: payload.email, password: payload.password } },
      })
      const u = driver.user
      user.value = u
      setDefaultAuth({ basic: { username: payload.email, password: payload.password } })
      saveToSession()
      return u
    }

    // Auto mode: only try Basic-first when cookie is NOT forced
    const doBasicFirst = mode === 'auto' && (!forceCookie && (allowBasicFallback && loginBasicFirst))
    if (doBasicFirst) {
      try {
        const driver: Driver = await apiGetProfile({
          auth: { basic: { username: payload.email, password: payload.password } },
        })
        const u = driver.user
        user.value = u
        setDefaultAuth({ basic: { username: payload.email, password: payload.password } })
        saveToSession()
        return u
      } catch {
        // Fall through to cookie login
      }
    }

    // Cookie mode (or auto after failing basic-first)
    await primeCsrf().catch(() => {})
    const u = await apiLogin(payload)
    setDefaultAuth(undefined)
    user.value = u
    saveToSession()
    return u
  } catch (e: any) {
    // Fallback to basic only in auto mode and when allowed by env
    if (mode === 'auto' && allowBasicFallback) {
      try {
        const driver: Driver = await apiGetProfile({
          auth: { basic: { username: payload.email, password: payload.password } },
        })
        const u = driver.user
        user.value = u
        setDefaultAuth({ basic: { username: payload.email, password: payload.password } })
        saveToSession()
        return u
      } catch (inner: any) {
        error.value = inner?.message || e?.message || 'Login failed'
        throw inner
      }
    }
    error.value = e?.message || 'Login failed'
    throw e
  } finally {
    loading.value = false
  }
}

async function logout() {
  loading.value = true
  error.value = null
  try {
    await apiLogout().catch(() => {})
  } finally {
    clear()
    // Clear any default Authorization (API key or Basic)
    setDefaultAuth(undefined)
    loading.value = false
  }
}

async function signup(payload: SignupRequest) {
  loading.value = true
  error.value = null
  try {
    const u = await apiSignup(payload)
    user.value = u
    saveToSession()
    return u
  } catch (e: any) {
    error.value = e?.message || 'Signup failed'
    throw e
  } finally {
    loading.value = false
  }
}

async function changePassword(payload: ChangePasswordRequest) {
  loading.value = true
  error.value = null
  try {
    const res = await apiChangePassword(payload)
    return res
  } catch (e: any) {
    error.value = e?.message || 'Change password failed'
    throw e
  } finally {
    loading.value = false
  }
}

function clear() {
  user.value = null
  clearSession()
}

export function useAuth() {
  return {
    user,
    isAuthenticated: computed(() => !!user.value),
    loading,
    error,
    login,
    logout,
    signup,
    changePassword,
    clear,
    bootstrapFromApi,
  }
}
