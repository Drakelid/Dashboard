import type { VercelRequest, VercelResponse } from '@vercel/node'

// Target API origin; can be overridden via env on Vercel if needed
const TARGET = process.env.VITE_API_TARGET || 'https://test.sambring.no'

function buildUpstreamUrl(req: VercelRequest): string {
  const segmentsParam = (req.query.segments as string[] | string | undefined)
  const segs = Array.isArray(segmentsParam)
    ? segmentsParam
    : (segmentsParam ? [segmentsParam] : [])

  const path = '/' + segs.map(s => encodeURIComponent(s)).join('/')
  // Preserve the original query string
  const originalUrl = new URL(req.url || '/', 'http://local')
  const search = originalUrl.search || ''
  return TARGET.replace(/\/$/, '') + path + search
}

async function readRawBody(req: VercelRequest): Promise<Buffer | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return chunks.length ? Buffer.concat(chunks) : undefined
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const upstreamUrl = buildUpstreamUrl(req)

    const body = await readRawBody(req)

    // Build headers: forward most, but set origin/referer to target; node fetch will set Host correctly
    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(req.headers)) {
      if (value == null) continue
      const lower = key.toLowerCase()
      // Skip hop-by-hop and encoding-specific headers
      if (['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'accept-encoding'].includes(lower)) continue
      if (Array.isArray(value)) headers[lower] = value.join(', ')
      else headers[lower] = String(value)
    }

    // Force target origin for CSRF-sensitive backends; keep Authorization if provided by client
    headers['origin'] = TARGET
    headers['referer'] = TARGET

    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    })

    // Copy status and selected headers through
    res.status(upstreamRes.status)
    upstreamRes.headers.forEach((v, k) => {
      // Pass through important headers
      if (['content-type', 'content-length', 'set-cookie', 'location', 'cache-control', 'vary'].includes(k.toLowerCase())) {
        res.setHeader(k, v)
      }
    })

    const buf = Buffer.from(await upstreamRes.arrayBuffer())
    res.send(buf)
  } catch (err: any) {
    res.status(502).json({ error: 'Bad Gateway', detail: err?.message || 'Proxy error' })
  }
}
