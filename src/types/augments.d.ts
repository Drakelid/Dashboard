declare module '@/types/api' {
  interface Delivery {
    uuid?: string
    service?: string
    fee?: number
    price?: number
    total_price?: number
    delivery_fee?: number
  }

  interface Package {
    description?: string
  }
}
