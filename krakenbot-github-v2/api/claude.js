// api/claude.js — Proxy para Anthropic API
// Evita exponer la API key en el cliente y resuelve CORS.

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'] || req.body?.apiKey;
  if (!apiKey) {
    return res.status(401).json({ error: 'API key requerida' });
  }

  try {
    const { messages, system, model, max_tokens } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':       'application/json',
        'x-api-key':          apiKey,
        'anthropic-version':  '2023-06-01',
      },
      body: JSON.stringify({
        model:      model      || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1024,
        system:     system,
        messages:   messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);

  } catch (err) {
    console.error('Claude proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
