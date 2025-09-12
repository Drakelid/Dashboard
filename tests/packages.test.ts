import { describe, it, expect } from 'vitest'
import { postJson, basicAuthHeader, hasCreds } from './helpers/apiClient'

describe('Package status endpoints', () => {
  it('POST /api/packages/{id}/pickup/ returns 404/401/403/400 for invalid or unauthorized', async function () {
    const id = 999999
    const payload = {
      success: true,
      message: 'Picked up',
      new_status: 'picked_up',
      new_status_display: 'Picked up',
      picked_up_at: new Date().toISOString(),
    }
    const headers = hasCreds() ? basicAuthHeader() : {}
    const { status } = await postJson(`/api/packages/${id}/pickup/`, payload, { headers })
    expect([404, 401, 403, 400]).toContain(status)
  })

  it('POST /api/packages/{id}/deliver/ returns 404/401/403/400 for invalid or unauthorized', async function () {
    const id = 999999
    const payload = {
      delivered_to: 'QA Recipient',
      delivery_notes: 'Integration test',
    }
    const headers = hasCreds() ? basicAuthHeader() : {}
    const { status } = await postJson(`/api/packages/${id}/deliver/`, payload, { headers })
    expect([404, 401, 403, 400]).toContain(status)
  })
})
