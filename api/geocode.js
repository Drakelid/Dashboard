const DEFAULT_USER_AGENT = process.env.GEOCODE_USER_AGENT || 'SamBringDriverDash/0.1 (support@sambring.no)';

/**
 * Vercel serverless proxy for OpenStreetMap Nominatim to avoid browser CORS issues.
 * Accepts query string ?q=<address>&limit=<n>
 */
module.exports = async function handler(req, res) {
  try {
    const originHost = req.headers.host || 'localhost';
    const scheme = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${scheme}://${originHost}`;
    const url = new URL(req.url || '/', baseUrl);
    const q = (url.searchParams.get('q') || '').trim();
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(10, Number(limitParam) || 1)) : 1;
    if (!q) {
      res.statusCode = 400;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing query parameter q' }));
      return;
    }

    const target = new URL('https://nominatim.openstreetmap.org/search');
    target.searchParams.set('format', 'jsonv2');
    target.searchParams.set('addressdetails', '0');
    target.searchParams.set('limit', String(limit));
    target.searchParams.set('q', q);

    const upstream = await fetch(target, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'application/json',
        'Accept-Language': req.headers['accept-language'] || 'en',
        Referer: baseUrl,
      },
    });

    const body = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(body);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Geocode proxy error', detail: err?.message || 'unknown' }));
  }
};
