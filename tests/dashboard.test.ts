import { describe, it, expect } from 'vitest'
import { getJson, basicAuthHeader, hasCreds } from './helpers/apiClient'

describe('Dashboard endpoints', () => {
  it('GET /dashboard/api/user-signups/ requires auth', async () => {
    const { status } = await getJson('/dashboard/api/user-signups/')
    expect([401, 403]).toContain(status)
  })

  it('GET /dashboard/api/user-signups/ with Basic returns 200 array when creds provided', async function () {
    if (!hasCreds()) return this.skip()
    const { status, data } = await getJson('/dashboard/api/user-signups/', { headers: basicAuthHeader() })
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})
