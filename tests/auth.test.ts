import { describe, it, expect } from 'vitest'
import { getJson, postJson, basicAuthHeader, hasCreds } from './helpers/apiClient'

const EMAIL = process.env.TEST_EMAIL
const PASSWORD = process.env.TEST_PASSWORD

describe('Auth', () => {
  it('GET /api/driver/profile/ without auth should be 401/403', async () => {
    const { status } = await getJson('/api/driver/profile/')
    expect([401, 403]).toContain(status)
  })

  it('GET /api/driver/profile/ with Basic should be 200 (when TEST_EMAIL/TEST_PASSWORD provided)', async function () {
    if (!hasCreds()) return this.skip()
    const { status, data } = await getJson('/api/driver/profile/', { headers: basicAuthHeader() })
    expect(status).toBe(200)
    expect(typeof data).toBe('object')
  })

  it('POST /api/auth/login/ responds (typically 403 unauth cookie login)', async () => {
    const { status } = await postJson('/api/auth/login/', { email: EMAIL || 'test@example.com', password: PASSWORD || 'invalid' })
    expect(status).toBeGreaterThanOrEqual(400)
  })
})
