import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error:
          "Missing OPENROUTER_API_KEY on the server. Set it and restart: $env:OPENROUTER_API_KEY='sk-or-...'"
      });
    }

    const message = String(req.body?.message ?? '').trim();
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

    const upstreamRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Optional but recommended by OpenRouter:
        'HTTP-Referer': 'http://localhost:4200',
        'X-Title': 'chatbot-app'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await upstreamRes.json().catch(() => null);

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: data?.error?.message || data?.message || 'Upstream error',
        details: data
      });
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      return res.status(502).json({ error: 'Unexpected upstream response', details: data });
    }

    return res.json({ text });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`);
});