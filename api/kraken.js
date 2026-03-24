module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, path } = req.query;
  if (!path) return res.status(400).json({ error: 'path required' });

  // Dos APIs diferentes de Kraken Futures:
  // type=charts → https://futures.kraken.com/api/charts/v1/  (velas OHLCV)
  // type=v3     → https://futures.kraken.com/derivatives/api/v3/  (ticker, ordenes)
  const base = type === 'charts'
    ? 'https://futures.kraken.com/api/charts/v1'
    : 'https://futures.kraken.com/derivatives/api/v3';

  const decodedPath = decodeURIComponent(path);
  const url = `${base}/${decodedPath}`;

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'KrakenBotMCA/4.0', 'Accept': 'application/json' }
    });
    const d = await r.json();
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message, url });
  }
};
