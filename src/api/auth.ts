import { http } from './http'
import type { ChangePasswordRequest, LoginRequest, SignupRequest, User } from '@/types/api'

function withToggle(path: string): string[] {
  return path.endsWith('/') ? [path, path.slice(0, -1)] : [path, path + '/']
}

async function postFirstOk<T>(paths: string[], body?: any): Promise<T> {
  let lastErr: any
  for (const p of paths) {
    try {
      return await http.post<T>(p, body)
    } catch (e: any) {
      lastErr = e
      if (e?.status !== 404) throw e
    }
  }
  throw lastErr
}

export async function login(payload: LoginRequest): Promise<User> {
  const ENV_AUTH_LOGIN_PATH = (import.meta as any).env?.VITE_AUTH_LOGIN_PATH as string | undefined
  const candidates = [
    ...(ENV_AUTH_LOGIN_PATH ? withToggle(ENV_AUTH_LOGIN_PATH) : []),
    ...withToggle('/api/auth/login/'),
  ]
  return postFirstOk<User>(candidates, payload)
}

export async function logout(): Promise<{ detail: string } | Record<string, unknown>> {
  const ENV_AUTH_LOGOUT_PATH = (import.meta as any).env?.VITE_AUTH_LOGOUT_PATH as string | undefined
  const candidates = [
    ...(ENV_AUTH_LOGOUT_PATH ? withToggle(ENV_AUTH_LOGOUT_PATH) : []),
    ...withToggle('/api/auth/logout/'),
  ]
  return postFirstOk(candidates)
}

export async function signup(payload: SignupRequest): Promise<User> {
  const ENV_AUTH_SIGNUP_PATH = (import.meta as any).env?.VITE_AUTH_SIGNUP_PATH as string | undefined
  const candidates = [
    ...(ENV_AUTH_SIGNUP_PATH ? withToggle(ENV_AUTH_SIGNUP_PATH) : []),
    ...withToggle('/api/auth/signup/'),
  ]
  return postFirstOk<User>(candidates, payload)
}

export async function changePassword(payload: ChangePasswordRequest): Promise<{ detail: string } | Record<string, unknown>> {
  const ENV_AUTH_CHANGE_PASSWORD_PATH = (import.meta as any).env?.VITE_AUTH_CHANGE_PASSWORD_PATH as string | undefined
  const candidates = [
    ...(ENV_AUTH_CHANGE_PASSWORD_PATH ? withToggle(ENV_AUTH_CHANGE_PASSWORD_PATH) : []),
    ...withToggle('/api/auth/change-password/'),
    ...withToggle('/auth/change-password/'),
  ]
  return postFirstOk(candidates, payload)
}
