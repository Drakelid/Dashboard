import { ref } from 'vue'
import { getProfile, getVehicle } from '@/api/driver'
import type { Driver, Vehicle } from '@/types/api'

const profile = ref<Driver | null>(null)
const vehicle = ref<Vehicle | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useDriverProfile() {
  async function load() {
    loading.value = true
    error.value = null
    try {
      const driverProfile = await getProfile()
      profile.value = driverProfile
      if (driverProfile?.vehicle) {
        vehicle.value = driverProfile.vehicle
      } else {
        vehicle.value = await getVehicle().catch(() => null)
      }
    } catch (e: any) {
      error.value = e?.message || 'Failed to load profile'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    vehicle,
    loading,
    error,
    load,
  }
}
