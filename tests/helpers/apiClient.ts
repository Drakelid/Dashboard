/* eslint-disable no-console */
import { expect } from 'vitest'

export const BASE_URL = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://test.sambring.no'
export const TEST_EMAIL = process.env.TEST_EMAIL
export const TEST_PASSWORD = process.env.TEST_PASSWORD

export function hasCreds() {
  return !!(TEST_EMAIL && TEST_PASSWORD)
}

export function basicAuthHeader() {
  if (!hasCreds()) return {}
  const token = Buffer.from(`${TEST_EMAIL}:${TEST_PASSWORD}`).toString('base64')
  return { Authorization: `Basic ${token}` }
}

export async function getJson<T>(path: string, init: RequestInit = {}): Promise<{ status: number; data: T }> {
  const url = new URL(path, BASE_URL)
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...init.headers,
    },
  })
  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : await res.text()
  return { status: res.status, data }
}

export async function postJson<T>(path: string, body: any, init: RequestInit = {}): Promise<{ status: number; data: T }> {
  const url = new URL(path, BASE_URL)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...init.headers,
    },
    body: JSON.stringify(body ?? {}),
  })
  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : await res.text()
  return { status: res.status, data }
}

export function assertArray(value: any) {
  expect(Array.isArray(value)).toBe(true)
}
