const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { apiKey, apiSecret, endpoint, params = {} } = req.body;
  if (!apiKey || !apiSecret) return res.status(401).json({ error: 'Keys required' });

  try {
    const nonce = Date.now().toString();
    const postData = new URLSearchParams(params).toString();
    const msg = postData + nonce + endpoint;
    const sha = crypto.createHash('sha256').update(msg).digest();
    const sig = crypto.createHmac('sha512', Buffer.from(apiSecret, 'base64')).update(sha).digest('base64');

    const r = await fetch(`https://futures.kraken.com/derivatives/api/v3${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'APIKey': apiKey, 'Nonce': nonce, 'Authent': sig
      },
      body: postData
    });
    const d = await r.json();
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
