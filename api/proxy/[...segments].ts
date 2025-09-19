// Target API origin; can be overridden via env on Vercel if needed
const TARGET = process.env.VITE_API_TARGET || 'https://test.sambring.no'

function buildUpstreamUrl(req: any): string {
  // Prefer taking the tail of the URL after /api/proxy to preserve trailing slashes exactly
  const url = req.url || '/'
  const idx = url.indexOf('/api/proxy')
  const tail = idx >= 0 ? url.slice(idx + '/api/proxy'.length) : url
  // Ensure we have a leading slash for the path portion
  const originalPathAndQuery = tail.startsWith('/') ? tail : ('/' + tail)
  return TARGET.replace(/\/$/, '') + originalPathAndQuery
}

async function readRawBody(req: any): Promise<Uint8Array | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined
  const chunks: Uint8Array[] = []
  const encoder = new TextEncoder()
  for await (const chunk of req) {
    if (chunk == null) continue
    if (typeof chunk === 'string') chunks.push(encoder.encode(chunk))
    else if (chunk instanceof Uint8Array) chunks.push(chunk)
    else if (typeof (chunk as any).arrayBuffer === 'function') {
      const ab: ArrayBuffer = await (chunk as any).arrayBuffer()
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

export default async function handler(req: any, res: any) {
  try {
    const upstreamUrl = buildUpstreamUrl(req)

    const body = await readRawBody(req)

    // Build headers: forward most, but set origin/referer to target; node fetch will set Host correctly
    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(req.headers)) {
      if (value == null) continue
      const lower = key.toLowerCase()
      // Skip hop-by-hop and encoding-specific headers
      if (['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'accept-encoding', 'host'].includes(lower)) continue
      if (Array.isArray(value)) headers[lower] = value.join(', ')
      else headers[lower] = String(value)
    }

    // Force target origin for CSRF-sensitive backends; keep Authorization if provided by client
    headers['origin'] = TARGET
    headers['referer'] = TARGET

    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: body,
      redirect: 'manual',
    })

    // Copy status and selected headers through
    res.statusCode = upstreamRes.status
    upstreamRes.headers.forEach((v, k) => {
      // Pass through important headers
      if (['content-type', 'content-length', 'set-cookie', 'location', 'cache-control', 'vary'].includes(k.toLowerCase())) {
        res.setHeader(k, v)
      }
    })

    const ab = await upstreamRes.arrayBuffer()
    const out = new Uint8Array(ab)
    res.end(out)
  } catch (err: any) {
    res.statusCode = 502
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Bad Gateway', detail: err?.message || 'Proxy error' }))
  }
}
