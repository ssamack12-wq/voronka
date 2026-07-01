const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { registerAuthRoutes } = require('./backend/auth');
const { registerApiRoutes } = require('./backend/api');
const { usePostgres } = require('./backend/store');
const { runMigrations } = require('./backend/db/migrate');
const { checkDb } = require('./backend/db/pool');

const app = express();

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is required in production');
  process.exit(1);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.set('trust proxy', 1);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

registerAuthRoutes(app);
registerApiRoutes(app);

const distDir = path.join(__dirname, 'dist');

app.use(express.static(distDir, { extensions: ['html'] }));

app.get('/health', async (_req, res) => {
  const payload = { ok: true, service: 'transaction-navigator', storage: usePostgres ? 'postgres' : 'file' };
  if (usePostgres) {
    try {
      await checkDb();
      payload.db = 'connected';
    } catch (err) {
      console.error(err);
      return res.status(503).json({ ...payload, db: 'error', ok: false });
    }
  }
  res.json(payload);
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

app.get('*', (req, res) => {
  if (/\.[a-z0-9]+$/i.test(req.path)) {
    return res.status(404).end();
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;

async function start() {
  if (usePostgres) {
    await runMigrations();
    console.info('[postgres] connected, migrations applied');
  } else {
    console.warn('[storage] DATABASE_URL not set — using local file store (dev only)');
  }

  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
    console.log(`Storage: ${usePostgres ? 'PostgreSQL' : 'file'}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
