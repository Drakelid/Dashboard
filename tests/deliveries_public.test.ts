import { describe, it, expect } from 'vitest'
import { getJson, postJson, basicAuthHeader, hasCreds } from './helpers/apiClient'

function authOpt() {
  return hasCreds() ? { headers: basicAuthHeader() } : {}
}

describe('Public delivery flow endpoints', () => {
  it('POST /api/request_delivery/ with minimal payload should respond (200 or validation error)', async () => {
    const payload = {
      sender_zip_code: '0150',
      receiver_zip_code: '5003',
      packages: [{ weight: '1.0', height: '10', width: '10', length: '10' }],
    }
    const { status } = await postJson('/api/request_delivery/', payload, authOpt())
    expect([200, 400, 401, 403]).toContain(status)
  })

  it('POST /api/confirm_delivery/ with empty body should be 400/401/403', async () => {
    const { status } = await postJson('/api/confirm_delivery/', {}, authOpt())
    expect([400, 401, 403]).toContain(status)
  })

  it('GET /api/status_delivery/?uuid=random should be 404/400', async () => {
    const { status } = await getJson('/api/status_delivery/?uuid=00000000-0000-0000-0000-000000000000')
    expect([404, 400]).toContain(status)
  })
})
