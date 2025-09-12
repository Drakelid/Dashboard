import { describe, it, expect } from 'vitest'
import { getJson, basicAuthHeader, hasCreds } from './helpers/apiClient'

describe('Driver endpoints', () => {
  it('GET /api/driver/profile/ requires auth', async () => {
    const { status } = await getJson('/api/driver/profile/')
    expect([401, 403]).toContain(status)
  })

  it('GET /api/driver/profile/ with Basic returns 200 when creds provided', async function () {
    if (!hasCreds()) return this.skip()
    const { status, data } = await getJson('/api/driver/profile/', { headers: basicAuthHeader() })
    expect(status).toBe(200)
    expect(typeof data).toBe('object')
    expect(data).toHaveProperty('user')
  })

  it('GET /api/driver/deliveries/?filter=future returns array (with Basic)', async function () {
    if (!hasCreds()) return this.skip()
    const { status, data } = await getJson('/api/driver/deliveries/?filter=future', { headers: basicAuthHeader() })
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it('GET /api/driver/deliveries/?filter=past returns array (with Basic)', async function () {
    if (!hasCreds()) return this.skip()
    const { status, data } = await getJson('/api/driver/deliveries/?filter=past', { headers: basicAuthHeader() })
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})
