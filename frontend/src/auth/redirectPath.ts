/** Безопасный redirect: только строковые пути (не React event). */
export function normalizeRedirectPath(path: unknown, fallback = '/app'): string {
  if (typeof path !== 'string') return fallback;
  const trimmed = path.trim();
  if (!trimmed.startsWith('/')) return fallback;
  return trimmed;
}
