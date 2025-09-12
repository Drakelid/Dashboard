import { ref } from 'vue'
import { getProfile } from '@/api/driver'
import type { Driver } from '@/types/api'

const profile = ref<Driver | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useDriverProfile() {
  async function load() {
    loading.value = true
    error.value = null
    try {
      profile.value = await getProfile()
    } catch (e: any) {
      error.value = e?.message || 'Failed to load profile'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    error,
    load,
  }
}
