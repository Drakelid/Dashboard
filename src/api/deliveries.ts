import { http } from './http'
import type { DriverSuggestion } from '@/types/api'
import type { RequestOptions } from '@/api/http'

// Suggested drivers for a delivery: GET /deliveries/{delivery_id}/api/suggested-drivers/
export async function getSuggestedDrivers(deliveryId: number, query?: { limit?: number; radius_km?: number }, opts?: RequestOptions): Promise<DriverSuggestion[]> {
  const path = `/deliveries/${deliveryId}/api/suggested-drivers/`
  return http.get<DriverSuggestion[]>(path, { ...(opts || {}), query })
}
