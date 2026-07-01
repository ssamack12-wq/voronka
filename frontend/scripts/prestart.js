/**
 * Пишет dist/env.js перед стартом serve.
 * Railway: API_URL или VITE_API_URL (можно без https:// — добавится автоматически).
 */
const fs = require('fs');
const path = require('path');

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

const apiUrl = normalizeApiUrl(process.env.API_URL || process.env.VITE_API_URL || '');
/** Пустая строка = запросы на тот же домен, /api проксируется production-server.js */
const clientApiUrl = apiUrl ? '' : '';

const distDir = path.join(__dirname, '..', 'dist');
const outFile = path.join(distDir, 'env.js');

if (!fs.existsSync(distDir)) {
  console.warn('[prestart] dist/ не найден — пропуск env.js');
  process.exit(0);
}

fs.writeFileSync(
  outFile,
  `window.__TN_API_URL__=${JSON.stringify(clientApiUrl)};\nwindow.__TN_API_PROXY__=${JSON.stringify(Boolean(apiUrl))};\n`
);
console.info(
  `[prestart] env.js → client API=${clientApiUrl || '(same-origin)'} proxy target=${apiUrl || '(нет)'}`
);
