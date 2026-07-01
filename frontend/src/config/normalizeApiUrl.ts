/** Приводит URL API к виду https://host (Railway часто задают без схемы). */
export function normalizeApiUrl(raw: string): string {
  let url = raw.trim().replace(/\/$/, '');
  if (!url) return '';

  if (/^https?:\/\//i.test(url)) return url;

  const isLocal =
    /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url) ||
    url.startsWith('localhost:') ||
    url.startsWith('127.0.0.1:');

  return `${isLocal ? 'http' : 'https'}://${url}`;
}
