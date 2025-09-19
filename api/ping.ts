export default async function handler(req: any, res: any) {
  res.statusCode = 200
  res.setHeader('content-type', 'application/json')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify({ ok: true, now: new Date().toISOString() }))
}
