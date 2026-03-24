module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'path required' });
  try {
    const r = await fetch(`https://futures.kraken.com/derivatives/api/v3/${path}`, {
      headers: { 'User-Agent': 'KrakenBotMCA/4.0' }
    });
    const d = await r.json();
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
