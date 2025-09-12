import { http } from './http'
import type { ChangePasswordRequest, LoginRequest, SignupRequest, User } from '@/types/api'

export async function login(payload: LoginRequest): Promise<User> {
  return http.post<User>('/api/auth/login/', payload)
}

export async function logout(): Promise<{ detail: string } | Record<string, unknown>> {
  return http.post('/api/auth/logout/')
}

export async function signup(payload: SignupRequest): Promise<User> {
  return http.post<User>('/api/auth/signup/', payload)
}

export async function changePassword(payload: ChangePasswordRequest): Promise<{ detail: string } | Record<string, unknown>> {
  return http.post('/api/auth/change-password/', payload)
}
