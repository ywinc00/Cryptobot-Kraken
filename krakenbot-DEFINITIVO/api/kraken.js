const BASE = 'https://futures.kraken.com/derivatives/api/v3';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'endpoint requerido' });

  try {
    const url = `${BASE}/${decodeURIComponent(endpoint)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'KrakenBotMCA/Vercel' }
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
