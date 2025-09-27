// Central API types derived from api-spec.txt

export type DimensionUnit = 'cm' | 'm' | 'in' | 'ft'
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz'
export type TemperatureUnit = 'C' | 'F'
export type DeliveryStatus = 'unprocessed' | 'ready_for_pickup' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'

export interface User {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
}

export interface Vehicle {
  id?: number
  make?: string
  model?: string
  color?: string
  license_plate?: string
  type?: string
  capacity?: number | null
  maximum_total_weight_kg?: number | null
  maximum_load_kg?: number | null
  registration_year?: number | null
  next_eu_control_date?: string | null
  next_inspection_date?: string | null
  engine_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'other' | null
  notes?: string | null
}


export interface Driver {
  id: number
  user: User
  vehicle?: Vehicle
  license_number?: string
  phone?: string
  address?: string
  active?: boolean
  start_date?: string | null
  end_date?: string | null
  status?: string
  created_at?: string
  updated_at?: string
}

export interface Actor {
  id?: number
  name: string
  address?: string
  phone?: string
}

export interface Delivery {
  id?: number
  pickup_date?: string | null
  pickup_time?: string | null
  delivery_date?: string | null
  delivery_time?: string | null
  pickup_location?: string
  delivery_location?: string
  sender?: Actor
  receiver?: Actor
}

export interface Package {
  id?: number
  length?: number
  width?: number
  height?: number
  dimension_unit?: DimensionUnit
  weight?: number
  weight_unit?: WeightUnit
  volume_liters?: number
  temperature_c?: number
  temperature_unit?: TemperatureUnit
  fragile?: boolean
  hazardous?: boolean
  delivery_status?: DeliveryStatus
  picked_up_at?: string | null
  delivered_at?: string | null
  delivered_to?: string | null
  delivery_notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface DriverDeliveryItem {
  type: string
  delivery: Delivery
  packages: Package[]
  location: string
  date: string // YYYY-MM-DD
  time: string // HH:mm:ss or similar
  actor: Actor
  actor_type: string // sender | receiver
  is_delivered: boolean
  pickup_location?: string
  pickup_date?: string | null
  pickup_time?: string | null
  pickup_actor?: Actor
}

export interface PackageDelivery {
  delivered_to: string
  delivery_notes?: string
  // Response extras
  success?: boolean
  message?: string
  new_status?: string
  new_status_display?: string
  delivered_at?: string
}

export interface PackageStatusUpdate {
  success: boolean
  message: string
  new_status: string
  new_status_display: string
  picked_up_at?: string
}

export type PackageDeliveryRequest = Pick<PackageDelivery, 'delivered_to' | 'delivery_notes'>
export type PackageStatusUpdateRequest = {
  success: boolean
  message: string
  new_status: string
  new_status_display: string
  picked_up_at?: string
}

export interface LoginRequest {
  email: string
  password: string
  login?: string
}
export interface SignupRequest {
  email: string
  password1: string
  password2: string
  first_name?: string
  last_name?: string
  actor_id?: number
  role_id?: number
}
export interface ChangePasswordRequest {
  old_password: string
  new_password1: string
  new_password2: string
}

export interface UserSignupStats { date: string; count: number }

// Public delivery flow (per swagger)
export interface DeliveryRequestPackage {
  weight: string
  height: string
  width: string
  length: string
  fragile?: boolean
  temperature?: string
}

export interface DeliveryRequest {
  sender_zip_code: string
  receiver_zip_code: string
  packages: DeliveryRequestPackage[]
}

export interface ServiceQuote {
  service: string
  price: number
}

export interface DeliveryQuoteResponse {
  uuid: string
  services: ServiceQuote[]
}

export interface ConfirmPackage {
  description?: string
  weight: string
  height: string
  width: string
  length: string
  fragile?: boolean
  temperature?: string
}

export interface ConfirmDeliveryRequest {
  uuid: string
  packages: ConfirmPackage[]
  sender?: number
  pickup_location?: string
  receiver: string
  receiver_phone: string
  delivery_location: string
  delivery_notes?: string
  service: string
  price: number
}

export interface ConfirmDeliveryResponse {
  uuid: string
  status: string
}

export interface DeliveryStatusPackage {
  id: number
  description?: string
  weight: string
  weight_unit?: WeightUnit
  length: string
  width: string
  height: string
  dimension_unit?: DimensionUnit
  temperature_range?: string
  temperature_unit?: TemperatureUnit
  volume?: string | null
  fragile?: boolean
  hazardous?: boolean
  delivery_status?: DeliveryStatus
  picked_up_at?: string | null
  delivered_at?: string | null
  delivered_to?: string | null
  delivery_notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface DeliveryStatusResponse {
  id: number
  uuid: string | null
  sender_name: string
  receiver_name?: string | null
  receiver_phone?: string | null
  pickup_location?: string | null
  pickup_date?: string | null
  pickup_time?: string | null
  delivery_location: string
  delivery_date?: string | null
  delivery_time?: string | null
  delivery_status?: string | null
  delivery_notes?: string | null
  service?: string | null
  price?: string | null
  created_at: string
  updated_at: string
  packages: DeliveryStatusPackage[]
}

