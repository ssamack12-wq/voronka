import {
  cacheSessionUser,
  clearAllLocalAuth,
  readAccessToken,
  readCachedSessionUser,
  storeAccessToken
} from './api';
import { fetchSession, refreshSession } from './api';
import { sanitizeAuthUser } from './sanitizeUser';
import { clearLoggedOutFlag, isLoggedOutLocally, markLoggedOut } from './sessionFlags';
import type { AuthUser } from './types';

const SESSION_BUNDLE_KEY = 'tn-session-bundle'; // sync with api.ts persistAuthResponse

export { markLoggedOut, clearLoggedOutFlag, isLoggedOutLocally };

function readStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

export function persistSession(user: AuthUser, accessToken?: string | null) {
  const safe = sanitizeAuthUser(user);
  if (!safe) return;
  if (accessToken) storeAccessToken(accessToken);
  cacheSessionUser(safe);
  const storage = readStorage();
  if (!storage) return;
  try {
    const token = accessToken || readAccessToken();
    if (token) {
      storage.setItem(SESSION_BUNDLE_KEY, JSON.stringify({ user: safe, accessToken: token }));
    } else {
      storage.removeItem(SESSION_BUNDLE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function clearPersistedSession() {
  clearAllLocalAuth();
}

export function readPersistedSession(): { user: AuthUser | null; accessToken: string | null } {
  const storage = readStorage();
  if (storage) {
    try {
      const raw = storage.getItem(SESSION_BUNDLE_KEY);
      if (raw) {
        const bundle = JSON.parse(raw) as { user?: AuthUser; accessToken?: string };
        const user = sanitizeAuthUser(bundle.user);
        const accessToken =
          typeof bundle.accessToken === 'string' && bundle.accessToken.length > 0
            ? bundle.accessToken
            : null;
        if (user && accessToken) {
          storeAccessToken(accessToken);
          cacheSessionUser(user);
          return { user, accessToken };
        }
      }
    } catch {
      /* ignore */
    }
  }

  const user = readCachedSessionUser();
  const accessToken = readAccessToken();
  if (user && accessToken) {
    return { user: sanitizeAuthUser(user), accessToken };
  }
  return { user: user ? sanitizeAuthUser(user) : null, accessToken: accessToken || null };
}

/** Загружает пользователя с сервера и обновляет локальную сессию. */
export async function refreshSessionUser(): Promise<AuthUser | null> {
  if (isLoggedOutLocally()) return null;
  const { user } = await fetchSession();
  if (user) {
    clearLoggedOutFlag();
    persistSession(user, readAccessToken());
    return user;
  }
  return null;
}

/** Живая сессия с токеном для API (оплата, админка). */
export async function ensureApiSession(): Promise<AuthUser | null> {
  if (isLoggedOutLocally()) return null;

  const stored = readPersistedSession();
  if (stored.user && stored.accessToken) {
    return stored.user;
  }

  const fromFetch = await fetchSession();
  const user = sanitizeAuthUser(fromFetch.user);
  const token = readAccessToken();
  if (user && token) {
    persistSession(user, token);
    return user;
  }

  const fromRefresh = await refreshSession();
  const refreshed = sanitizeAuthUser(fromRefresh);
  const refreshToken = readAccessToken();
  if (refreshed && refreshToken) {
    persistSession(refreshed, refreshToken);
    return refreshed;
  }

  if (user && !token) {
    clearPersistedSession();
  }

  return null;
}
