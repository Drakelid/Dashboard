export type TaskPriority = 'urgent' | 'express' | 'standard'

export interface DeliveryTask {
  id: string
  type: string
  location: string
  address: string
  time: string
  priority: TaskPriority
  distance: string
  ecoFriendly: boolean
  earnings: string
}
