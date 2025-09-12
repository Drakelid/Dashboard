import { describe, it, expect } from 'vitest'
import { postJson, basicAuthHeader, hasCreds } from './helpers/apiClient'

/**
 * Tests for assignment-related endpoints
 */
describe('Assignments', () => {
  it('POST /api/packages/assign_package/ with { package_id: 0 } should respond (nearby suggestions or validation)', async function () {
    // Prefer running with Basic when creds are available
    const headers = hasCreds() ? basicAuthHeader() : {}
    const { status, data } = await postJson('/api/packages/assign_package/', { package_id: 0 }, { headers })
    // Many servers return 200 with suggestions; some may 401/403 without auth; or 400 if not supported
    expect([200, 400, 401, 403]).toContain(status)
    // When 200, data may be an array or object with `results`. Don't assert shape strictly here.
    if (status === 200) {
      expect(typeof data === 'object' || Array.isArray(data)).toBe(true)
    }
  })

  it('POST /api/packages/assign_package/ with invalid id returns 4xx', async function () {
    const headers = hasCreds() ? basicAuthHeader() : {}
    const { status } = await postJson('/api/packages/assign_package/', { package_id: 999999999 }, { headers })
    expect([400, 401, 403, 404]).toContain(status)
  })
})
