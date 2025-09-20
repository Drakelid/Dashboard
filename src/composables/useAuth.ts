import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout, signup as apiSignup, changePassword as apiChangePassword } from '@/api/auth'
import type { ChangePasswordRequest, LoginRequest, SignupRequest, User, Driver, Vehicle } from '@/types/api'
import { setDefaultAuth, primeCsrf } from '@/api/http'
import { getProfile as apiGetProfile, getVehicle as apiGetVehicle } from '@/api/driver'

const user = ref<User | null>(null)
const driver = ref<Driver | null>(null)
const vehicle = ref<Vehicle | null>(null)
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
// Only force cookie on Vercel when not explicitly set to basic via env
const defaultForceCookie = authMode === 'cookie' || (isVercelHost && authMode !== 'basic')

const hasVehicle = computed(() => !!vehicle.value && Object.keys(vehicle.value || {}).length > 0)
const displayName = computed(() => {
  const d = driver.value
  if (!d?.user) return user.value?.email || 'Driver'
  const { first_name, last_name } = d.user
  if (first_name || last_name) return `${first_name || ''} ${last_name || ''}`.trim()
  return d.user.email || d.user.username
})

async function bootstrapFromApi(): Promise<User | null> {
  try {
    const driverProfile: Driver = await apiGetProfile()
    const u = driverProfile.user
    user.value = u
    driver.value = driverProfile
    vehicle.value = driverProfile.vehicle || (await apiGetVehicle().catch(() => null))
    saveToSession()
    return u
  } catch {
    return null
  }
}

async function login(payload: LoginRequest, opts?: { mode?: 'cookie' | 'basic' | 'auto' }) {
  const mode = opts?.mode || 'auto'
  const forceCookie = (mode !== 'basic') && defaultForceCookie
  loading.value = true
  error.value = null
  try {
    // Force cookie mode only when not explicitly using Basic
    if (forceCookie) {
      try {
        await primeCsrf().catch(() => {})
        const u = await apiLogin(payload)
        setDefaultAuth(undefined)
        user.value = u
        driver.value = await apiGetProfile().catch(() => null)
        vehicle.value = await apiGetVehicle().catch(() => driver.value?.vehicle || null)
        saveToSession()
        return u
      } catch (e: any) {
        // If the session login endpoint is missing (404), fall back to Basic auth automatically
        if (e?.status === 404) {
          try {
            const driverProfile: Driver = await apiGetProfile({
              auth: { basic: { username: payload.email, password: payload.password } },
            })
            const u = driverProfile.user
            user.value = u
            driver.value = driverProfile
            vehicle.value = driverProfile.vehicle || (await apiGetVehicle({ auth: { basic: { username: payload.email, password: payload.password } } }).catch(() => null))
            setDefaultAuth({ basic: { username: payload.email, password: payload.password } })
            saveToSession()
            return u
          } catch (inner) {
            throw e
          }
        }
        throw e
      }
    }

    // If explicitly in API-key mode (and not forcing cookie), validate by fetching profile
    if (preferApiKey && !forceCookie) {
      const u = await bootstrapFromApi()
      if (!u) throw new Error('Invalid API key or insufficient permissions')
      return u
    }

    // Explicit Basic mode
    if (mode === 'basic') {
      const driverProfile: Driver = await apiGetProfile({
        auth: { basic: { username: payload.email, password: payload.password } },
      })
      const u = driverProfile.user
      user.value = u
      driver.value = driverProfile
      vehicle.value = driverProfile.vehicle || (await apiGetVehicle({ auth: { basic: { username: payload.email, password: payload.password } } }).catch(() => null))
      setDefaultAuth({ basic: { username: payload.email, password: payload.password } })
      saveToSession()
      return u
    }

    // Auto mode: only try Basic-first when cookie is NOT forced
    const doBasicFirst = mode === 'auto' && (!forceCookie && (allowBasicFallback && loginBasicFirst))
    if (doBasicFirst) {
      try {
        const driverProfile: Driver = await apiGetProfile({
          auth: { basic: { username: payload.email, password: payload.password } },
        })
        const u = driverProfile.user
        user.value = u
        driver.value = driverProfile
        vehicle.value = driverProfile.vehicle || (await apiGetVehicle({ auth: { basic: { username: payload.email, password: payload.password } } }).catch(() => null))
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
    driver.value = await apiGetProfile().catch(() => null)
    vehicle.value = await apiGetVehicle().catch(() => driver.value?.vehicle || null)
    saveToSession()
    return u
  } catch (e: any) {
    // Fallback to basic only in auto mode and when allowed by env
    if (mode === 'auto' && allowBasicFallback) {
      try {
        const driverProfile: Driver = await apiGetProfile({
          auth: { basic: { username: payload.email, password: payload.password } },
        })
        const u = driverProfile.user
        user.value = u
        driver.value = driverProfile
        vehicle.value = driverProfile.vehicle || (await apiGetVehicle({ auth: { basic: { username: payload.email, password: payload.password } } }).catch(() => null))
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
    driver.value = await apiGetProfile().catch(() => null)
    vehicle.value = await apiGetVehicle().catch(() => driver.value?.vehicle || null)
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
  driver.value = null
  vehicle.value = null
  clearSession()
}

export function useAuth() {
  return {
    user,
    driver,
    vehicle,
    loading,
    error,
    isAuthenticated: computed(() => !!user.value),
    displayName,
    hasVehicle,
    login,
    logout,
    signup,
    changePassword,
    bootstrapFromApi,
    clear,
  }
}

