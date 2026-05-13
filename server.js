const path = require('path');
const express = require('express');

const app = express();
app.use(express.json({ limit: '1mb' }));

const distDir = path.join(__dirname, 'dist');

app.use(express.static(distDir, { extensions: ['html'] }));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/lead', async (req, res) => {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return res.status(500).json({ error: 'GOOGLE_SCRIPT_URL is not set' });
  }

  try {
    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {})
    });

    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    }

    const text = await upstream.text();
    return res.status(upstream.status).send(text);
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Failed to forward lead' });
  }
});

// SPA fallback: не отдавать index.html вместо отсутствующего файла (иначе <img src="*.svg"> ломается)
app.get('*', (req, res) => {
  if (/\.[a-z0-9]+$/i.test(req.path)) {
    return res.status(404).end();
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

