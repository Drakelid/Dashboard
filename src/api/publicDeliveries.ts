import { http } from './http'
import type {
  DeliveryRequest,
  DeliveryQuoteResponse,
  ConfirmDeliveryRequest,
  ConfirmDeliveryResponse,
  DeliveryStatusResponse,
} from '@/types/api'

export async function requestDelivery(payload: DeliveryRequest): Promise<DeliveryQuoteResponse> {
  return http.post<DeliveryQuoteResponse>('/api/request_delivery/', payload)
}

export async function confirmDelivery(payload: ConfirmDeliveryRequest): Promise<ConfirmDeliveryResponse> {
  return http.post<ConfirmDeliveryResponse>('/api/confirm_delivery/', payload)
}

export async function getDeliveryStatus(uuid: string): Promise<DeliveryStatusResponse> {
  return http.get<DeliveryStatusResponse>('/api/status_delivery/', { query: { uuid } })
}
