import { ref } from 'vue'
import { listDeliveries } from '@/api/driver'
import type { DriverDeliveryItem } from '@/types/api'

const future = ref<DriverDeliveryItem[] | null>(null)
const past = ref<DriverDeliveryItem[] | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Data originates from /api/driver/deliveries/ (see SamBringNew.yaml)
async function fetchDeliveries(filter: 'future' | 'past') {
  loading.value = true
  error.value = null
  try {
    const data = await listDeliveries(filter)
    if (filter === 'future') future.value = data
    else past.value = data
  } catch (e: any) {
    // Handle errors gracefully without throwing to avoid unhandled promise rejections in views
    const status = e?.status
    if (status === 401) {
      error.value = 'Please sign in to view your deliveries.'
    } else {
      error.value = e?.message || 'Failed to load deliveries'
    }
    // Do not rethrow; unauthorized handler (if set) will redirect, and the view can show `error`
    return
  } finally {
    loading.value = false
  }
}

async function loadAll() {
  await Promise.allSettled([
    fetchDeliveries('future'),
    fetchDeliveries('past'),
  ])
}

export function useDriverDeliveries() {
  return {
    future,
    past,
    loading,
    error,
    loadFuture: () => fetchDeliveries('future'),
    loadPast: () => fetchDeliveries('past'),
    loadAll,
    refresh: loadAll,
  }
}
