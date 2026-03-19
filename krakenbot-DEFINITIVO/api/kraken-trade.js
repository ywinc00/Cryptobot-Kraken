const crypto = require('crypto');
const BASE   = 'https://futures.kraken.com/derivatives/api/v3';

function sign(endpoint, nonce, postData, secret) {
  const msg    = postData + nonce + endpoint;
  const sha256 = crypto.createHash('sha256').update(msg).digest();
  const key    = Buffer.from(secret, 'base64');
  return crypto.createHmac('sha512', key).update(sha256).digest('base64');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { krakenApiKey, krakenSecret, endpoint, params = {} } = req.body;
  if (!krakenApiKey || !krakenSecret) {
    return res.status(401).json({ error: 'Kraken keys requeridas' });
  }

  try {
    const nonce    = Date.now().toString();
    const postData = new URLSearchParams(params).toString();
    const authent  = sign(endpoint, nonce, postData, krakenSecret);

    const response = await fetch(`${BASE}${endpoint}`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'APIKey':   krakenApiKey,
        'Nonce':    nonce,
        'Authent':  authent,
      },
      body: postData,
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
