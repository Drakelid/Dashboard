module.exports = async (req, res) => {
  try {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    res.end(JSON.stringify({ ok: true, runtime: 'node', ts: Date.now() }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: e?.message || 'server error' }));
  }
};
