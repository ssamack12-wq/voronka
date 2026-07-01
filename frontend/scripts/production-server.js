/**
 * Статика + прокси /api → бэкенд (один домен для cookies и Bearer).
 * Railway frontend: API_URL = URL бэкенда, env.js с пустым __TN_API_URL__.
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const handler = require('serve-handler');

function normalizeApiUrl(raw) {
  let url = String(raw || '')
    .trim()
    .replace(/\/$/, '');
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const isLocal =
    /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url) ||
    url.startsWith('localhost:') ||
    url.startsWith('127.0.0.1:');
  return `${isLocal ? 'http' : 'https'}://${url}`;
}

const PORT = Number(process.env.PORT) || 3000;
const DIST = path.join(__dirname, '..', 'dist');
const API_TARGET = normalizeApiUrl(process.env.API_URL || process.env.VITE_API_URL || '');

/** Не подменять SEO-файлы SPA index.html (иначе /sitemap.xml отдаёт HTML). */
const NO_SPA_FALLBACK = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest',
  '/terms-of-service.pdf',
  '/env.js'
]);

function getServeConfig(req) {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  const rewrites = NO_SPA_FALLBACK.has(pathname)
    ? []
    : [{ source: '**', destination: '/index.html' }];

  return { public: DIST, rewrites };
}

function proxyToApi(req, res) {
  if (!API_TARGET) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API_URL не задан на frontend-сервисе' }));
    return;
  }

  const target = new URL(req.url, API_TARGET);
  const isHttps = target.protocol === 'https:';
  const lib = isHttps ? https : http;

  const headers = { ...req.headers, host: target.host };
  delete headers.connection;
  delete headers['content-length'];

  const options = {
    hostname: target.hostname,
    port: target.port || (isHttps ? 443 : 80),
    path: target.pathname + target.search,
    method: req.method,
    headers
  };

  const proxyReq = lib.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[proxy]', err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Не удалось связаться с API' }));
    }
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (API_TARGET && req.url && req.url.startsWith('/api/')) {
    proxyToApi(req, res);
    return;
  }

  return handler(req, res, getServeConfig(req));
});

if (!fs.existsSync(DIST)) {
  console.error('[server] dist/ не найден. Сначала npm run build');
  process.exit(1);
}

server.listen(PORT, () => {
  console.info(`[server] http://0.0.0.0:${PORT}`);
  console.info(`[server] static: ${DIST}`);
  console.info(`[server] api proxy: ${API_TARGET || '(выключен — задайте API_URL)'}`);
});
