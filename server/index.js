import 'dotenv/config';
import express from 'express';

const app = express();

// Enable CORS for frontend container
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// SSE streaming endpoint
app.post('/api/stream', async (req, res) => {
  const message = String(req.body?.message ?? '').trim();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.write(`event: progress\ndata: Error: Missing OPENROUTER_API_KEY\n\n`);
    res.write('event: done\ndata: \n\n');
    res.end();
    return;
  }

  try {
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

    const upstreamRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4200',
        'X-Title': 'chatbot-app'
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          {
            role: 'assistant',
            content: `You are a helpful assistant that provides informative responses with markdown formatting.

When presenting numerical data, comparisons, rankings, or statistics, include a chart at the end of your response using this exact format:
<chart>{"type": "bar", "title": "Chart Title", "data": [{"name": "Label1", "value": 100}, {"name": "Label2", "value": 80}]}</chart>

Rules for charts:
- Only include a chart when there's meaningful numerical data to visualize
- Keep data entries to 6-8 items maximum for readability
- Use descriptive but short names (max 10 characters)
- Values should be positive numbers
- The chart JSON must be valid and on a single line

Use markdown for formatting: **bold**, *italic*, lists, tables, code blocks, etc.`
          },
          { role: 'user', content: message }
        ]
      })
    });

    if (!upstreamRes.ok) {
      const errorData = await upstreamRes.json().catch(() => ({}));
      res.write(`event: progress\ndata: Error: ${errorData.error?.message || 'API request failed'}\n\n`);
      res.write('event: done\ndata: \n\n');
      res.end();
      return;
    }

    const reader = upstreamRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`event: progress\ndata: ${content}\n\n`);
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    res.write('event: done\ndata: \n\n');
    res.end();
  } catch (err) {
    res.write(`event: progress\ndata: Error: ${err.message || 'Unknown error'}\n\n`);
    res.write('event: done\ndata: \n\n');
    res.end();
  }
});


const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`[API] listening on http://localhost:${port}`);
  console.log(`[API] Received message: ${process.env.PORT}`);

});
