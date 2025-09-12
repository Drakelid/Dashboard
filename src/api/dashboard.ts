import { http } from './http'
import type { UserSignupStats } from '@/types/api'

export async function getUserSignupStats(): Promise<UserSignupStats[]> {
  return http.get<UserSignupStats[]>('/dashboard/api/user-signups/')
}
