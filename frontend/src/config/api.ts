import { normalizeApiUrl } from './normalizeApiUrl';

/** URL API из vite build (Railway build-time VITE_API_URL). */
const BUILT_API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL ?? '');

declare global {
  interface Window {
    __TN_API_URL__?: string;
    __TN_API_PROXY__?: boolean;
  }
}

function getRuntimeApiUrl(): string | null {
  if (typeof window === 'undefined') return null;
  if (!('__TN_API_URL__' in window)) return null;
  return normalizeApiUrl(window.__TN_API_URL__ ?? '');
}

/**
 * Базовый URL API: runtime env.js → build (VITE) → текущий origin (прокси /api).
 */
function resolveApiBase(): string {
  const runtime = getRuntimeApiUrl();
  if (runtime !== null) {
    if (runtime) return runtime;
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  if (BUILT_API_URL) return BUILT_API_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export const API_BASE = resolveApiBase();

export function isApiConfigured(): boolean {
  return Boolean(getRuntimeApiUrl() || BUILT_API_URL);
}

/** @deprecated используйте isApiConfigured() */
export const IS_API_URL_CONFIGURED = isApiConfigured();

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
