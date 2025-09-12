import { ref } from 'vue'
import { getUserSignupStats } from '@/api/dashboard'
import type { UserSignupStats } from '@/types/api'

const stats = ref<UserSignupStats[] | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useDashboardStats() {
  async function load() {
    loading.value = true
    error.value = null
    try {
      stats.value = await getUserSignupStats()
    } catch (e: any) {
      error.value = e?.message || 'Failed to load dashboard stats'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    load,
  }
}
