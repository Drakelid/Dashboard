// Target API origin; prefer explicit env overrides and fall back to test API
const RAW_TARGET =
  process.env.VITE_API_TARGET ||
  process.env.VITE_API_BASE_URL ||
  process.env.API_TARGET ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.PUBLIC_API_BASE_URL ||
  ''

const TARGET_BASE = (RAW_TARGET && RAW_TARGET.trim().length ? RAW_TARGET : 'https://test.sambring.no').replace(/\/$/, '')
const TARGET = TARGET_BASE

function buildUpstreamUrl(req) {
  const url = req.url || '/'
  const idx = url.indexOf('/api/proxy')
  const tail = idx >= 0 ? url.slice(idx + '/api/proxy'.length) : url
  let originalPathAndQuery = tail.startsWith('/') ? tail : ('/' + tail)
  const proxyPrefix = '/api/proxy'
  while (originalPathAndQuery.startsWith(proxyPrefix + '/')) {
    originalPathAndQuery = originalPathAndQuery.slice(proxyPrefix.length)
    if (!originalPathAndQuery.startsWith('/')) originalPathAndQuery = '/' + originalPathAndQuery
  }
  return TARGET_BASE + originalPathAndQuery
}

async function readRawBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined
  const chunks = []
  const encoder = new TextEncoder()
  for await (const chunk of req) {
    if (chunk == null) continue
    if (typeof chunk === 'string') chunks.push(encoder.encode(chunk))
    else if (chunk instanceof Uint8Array) chunks.push(chunk)
    else if (typeof chunk.arrayBuffer === 'function') {
      const ab = await chunk.arrayBuffer()
      chunks.push(new Uint8Array(ab))
    } else {
      chunks.push(encoder.encode(String(chunk)))
    }
  }
  if (chunks.length === 0) return undefined
  const total = chunks.reduce((acc, c) => acc + c.byteLength, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) { out.set(c, offset); offset += c.byteLength }
  return out
}

module.exports = async function handler(req, res) {
  try {
    const upstreamUrl = buildUpstreamUrl(req)

    // Built-in debug endpoint: any request path ending with /__debug returns proxy status
    try {
      const urlStr = req.url || '/'
      const qIndex = urlStr.indexOf('?')
      const onlyPath = qIndex >= 0 ? urlStr.slice(0, qIndex) : urlStr
      const start = onlyPath.indexOf('/api/proxy')
      const tail = start >= 0 ? onlyPath.slice(start + '/api/proxy'.length) : onlyPath
      if (tail.endsWith('/__debug')) {
        res.statusCode = 200
        res.setHeader('content-type', 'application/json')
        res.setHeader('x-proxy-function', 'active')
        res.setHeader('x-proxy-target-origin', TARGET)
        res.setHeader('Access-Control-Expose-Headers', 'x-proxy-function, x-proxy-target-origin')
        res.end(JSON.stringify({ ok: true, target: TARGET, tail }))
        return
      }
    } catch {}

    const body = await readRawBody(req)

    const headers = {}
    for (const [key, value] of Object.entries(req.headers)) {
      if (value == null) continue
      const lower = key.toLowerCase()
      if (['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'accept-encoding', 'host'].includes(lower)) continue
      if (Array.isArray(value)) headers[lower] = value.join(', ')
      else headers[lower] = String(value)
    }

    headers['origin'] = TARGET
    headers['referer'] = TARGET

    const bodyInit = (body !== undefined) ? body : undefined
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: bodyInit,
      redirect: 'manual',
    })

    res.statusCode = upstreamRes.status
    const passthrough = new Set(['content-type', 'content-length', 'location', 'cache-control', 'vary'])
    res.setHeader('x-proxy-upstream-url', upstreamUrl)
    res.setHeader('x-proxy-target-origin', TARGET)
    res.setHeader('x-proxy-request-method', req.method || '')
    const expose = 'x-proxy-upstream-url, x-proxy-target-origin, x-proxy-request-method'
    const existingExpose = res.getHeader('access-control-expose-headers')
    if (existingExpose) {
      const merged = String(existingExpose)
        .split(',')
        .map(s => s.trim().toLowerCase())
        .concat(expose.split(',').map(s => s.trim().toLowerCase()))
        .filter((v, i, a) => v && a.indexOf(v) === i)
        .join(', ')
      res.setHeader('Access-Control-Expose-Headers', merged)
    } else {
      res.setHeader('Access-Control-Expose-Headers', expose)
    }

    upstreamRes.headers.forEach((v, k) => {
      const key = k.toLowerCase()
      if (key === 'set-cookie') return
      if (passthrough.has(key)) {
        res.setHeader(k, v)
      }
    })

    const hostHeader = (req.headers['x-forwarded-host'] || req.headers['host'] || '')
    const currentHost = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader
    let setCookies = []
    const anyHeaders = upstreamRes.headers
    if (anyHeaders && typeof anyHeaders.getSetCookie === 'function') {
      setCookies = anyHeaders.getSetCookie()
    } else if (anyHeaders && typeof anyHeaders.raw === 'function') {
      const raw = anyHeaders.raw()
      if (raw && raw['set-cookie']) setCookies = raw['set-cookie']
    } else {
      const sc = upstreamRes.headers.get('set-cookie')
      if (sc) setCookies = [sc]
    }
    if (setCookies.length) {
      const rewritten = setCookies.map((c) => {
        let out = c.replace(/;\s*Domain=[^;]*/i, '')
        if (!/;\s*Path=/i.test(out)) out += '; Path=/'
        return out
      })
      res.setHeader('Set-Cookie', rewritten)
    }

    const ab = await upstreamRes.arrayBuffer()
    const out = new Uint8Array(ab)
    res.end(out)
  } catch (err) {
    res.statusCode = 502
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Bad Gateway', detail: err && err.message ? err.message : 'Proxy error' }))
  }
}
