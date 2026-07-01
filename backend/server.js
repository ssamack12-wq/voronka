const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { registerAuthRoutes } = require('./auth');
const { getResendStatus } = require('./email/resendConfig');
const { registerApiRoutes } = require('./api');
const { registerPaymentRoutes } = require('./payments');
const { registerAdminRoutes } = require('./adminRoutes');
const { forwardLeadToGoogleSheets, isSheetsConfigured } = require('./services/googleSheets');
const yookassa = require('./services/yookassa');
const { usePostgres } = require('./store');
const { runMigrations } = require('./db/migrate');
const { checkDb } = require('./db/pool');

const app = express();

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is required in production');
  process.exit(1);
}

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trim();

function normalizeOrigin(url) {
  return String(url || '')
    .trim()
    .replace(/\/$/, '');
}

function getAllowedOrigins() {
  const fromEnv = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);
  const primary = normalizeOrigin(FRONTEND_URL);
  return [...new Set([primary, ...fromEnv].filter(Boolean))];
}

const allowedOrigins = getAllowedOrigins();

app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      console.warn(`[cors] blocked: ${origin} (allowed: ${allowedOrigins.join(', ') || 'none'})`);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

registerAuthRoutes(app);
registerApiRoutes(app);
registerPaymentRoutes(app);
registerAdminRoutes(app);

app.get('/', (_req, res) => {
  if (FRONTEND_URL && FRONTEND_URL !== 'http://localhost:5173') {
    return res.redirect(302, FRONTEND_URL);
  }
  res.json({
    service: 'transaction-navigator-api',
    hint: 'Откройте URL фронтенда (FRONTEND_URL), не API.'
  });
});

app.get('/health', async (_req, res) => {
  const payload = {
    ok: true,
    service: 'transaction-navigator-api',
    storage: usePostgres ? 'postgres' : 'file',
    resend: getResendStatus(),
    sheets: { configured: isSheetsConfigured() },
    yookassa: { configured: yookassa.isConfigured() },
    cors: { frontendUrl: normalizeOrigin(FRONTEND_URL), allowedOrigins }
  };
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
  if (!isSheetsConfigured()) {
    return res.status(503).json({
      error:
        'GOOGLE_SCRIPT_URL не задан на бэкенде (Railway → backend → Variables). Лид не отправлен в таблицу.'
    });
  }

  try {
    const body = req.body ?? {};
    const payload = {
      source: 'knowledge_quiz',
      phone: body.phone ?? '',
      city: body.city ?? '',
      type: body.type ?? '',
      readiness: body.readiness != null ? String(body.readiness) : '',
      riskScore: body.riskScore != null ? String(body.riskScore) : '',
      answers: body.answers ?? []
    };
    await forwardLeadToGoogleSheets(payload);
    res.json({ ok: true });
  } catch (e) {
    console.error('[api/lead]', e);
    return res.status(502).json({
      error: e instanceof Error ? e.message : 'Не удалось отправить лид в Google Sheets'
    });
  }
});

const port = process.env.PORT || 3000;

async function start() {
  if (usePostgres) {
    await runMigrations();
    console.info('[postgres] migrations applied');
  } else {
    console.warn('[storage] DATABASE_URL not set — file store (dev only)');
  }

  const resendStatus = getResendStatus();
  if (!resendStatus.ok) {
    console.warn(`[resend] NOT configured: ${resendStatus.reason}`);
  } else {
    console.info(`[resend] configured, from=${resendStatus.from}`);
  }

  app.listen(port, () => {
    console.log(`API listening on ${port}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`Storage: ${usePostgres ? 'PostgreSQL' : 'file'}`);
  });
}

start().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
