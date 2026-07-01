import { create } from 'zustand';
import * as authApi from './api';
import {
  DOMAIN_RESTRICTION_ERROR,
  isAllowedEmailDomain,
  isValidEmailFormat
} from './allowedDomains';
import {
  clearLoggedOutFlag,
  clearPersistedSession,
  isLoggedOutLocally,
  markLoggedOut,
  persistSession,
  readPersistedSession
} from './session';
import { normalizeRedirectPath } from './redirectPath';
import { sanitizeAuthUser } from './sanitizeUser';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  authModalOpen: boolean;
  loginPending: boolean;
  pendingEmail: string;
  devCode: string | null;
  devLink: string | null;
  redirectPath: string | null;
  error: string | null;
  checkSession: (options?: { silent?: boolean }) => Promise<void>;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
  requestAccess: (redirectPath?: string) => Promise<boolean>;
  requestLogin: (email: string) => Promise<boolean>;
  verifyCode: (code: string) => Promise<void>;
  /** @deprecated */
  sendMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  resetLoginFlow: () => void;
}

let checkSessionInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  authModalOpen: false,
  loginPending: false,
  pendingEmail: '',
  devCode: null,
  devLink: null,
  redirectPath: null,
  error: null,

  checkSession: async (options) => {
    if (checkSessionInFlight) return checkSessionInFlight;
    const silent = options?.silent === true;

    checkSessionInFlight = (async () => {
      if (isLoggedOutLocally()) {
        clearPersistedSession();
        void authApi.logout().catch(() => undefined);
        set({ user: null, isLoading: false, error: null });
        return;
      }

      if (!silent) set({ isLoading: true, error: null });

      const stored = readPersistedSession();
      let user: AuthUser | null = stored.user && stored.accessToken ? stored.user : null;

      try {
        const { user: fromServer } = await authApi.fetchSession();
        if (fromServer) {
          clearLoggedOutFlag();
          persistSession(fromServer, authApi.readAccessToken());
          user = fromServer;
        } else {
          clearPersistedSession();
          user = null;
        }
      } catch {
        if (silent) {
          user = get().user ?? (stored.user && stored.accessToken ? stored.user : null);
        } else {
          user = stored.user && stored.accessToken ? stored.user : null;
        }
      }

      set({
        user,
        isLoading: false,
        redirectPath: normalizeRedirectPath(get().redirectPath)
      });
    })();

    try {
      await checkSessionInFlight;
    } finally {
      checkSessionInFlight = null;
    }
  },

  openAuthModal: (redirectPath) =>
    set({
      authModalOpen: true,
      loginPending: false,
      error: null,
      devCode: null,
      devLink: null,
      redirectPath:
        typeof redirectPath === 'string'
          ? normalizeRedirectPath(redirectPath)
          : normalizeRedirectPath(get().redirectPath)
    }),

  closeAuthModal: () =>
    set({
      authModalOpen: false,
      loginPending: false,
      error: null,
      devCode: null,
      devLink: null,
      redirectPath: null
    }),

  resetLoginFlow: () =>
    set({ loginPending: false, pendingEmail: '', devCode: null, devLink: null, error: null }),

  requestAccess: async (redirectPath = '/app') => {
    const path = normalizeRedirectPath(redirectPath);
    set({ redirectPath: path, error: null });
    await get().checkSession();
    if (get().user) {
      set({ redirectPath: null });
      return true;
    }
    set({ authModalOpen: true, loginPending: false });
    return false;
  },

  requestLogin: async (email) => {
    const normalized = email.trim().toLowerCase();
    if (!isValidEmailFormat(normalized)) {
      set({ error: 'Укажите корректный email', pendingEmail: normalized });
      return false;
    }
    if (!isAllowedEmailDomain(normalized)) {
      set({ error: DOMAIN_RESTRICTION_ERROR, pendingEmail: normalized });
      return false;
    }
    set({ error: null, pendingEmail: normalized });
    try {
      const result = await authApi.requestLogin(normalized);
      // In production we always require OTP/magic-link verification.
      // "Immediate" login is only allowed for local development / explicit bypass.
      if (import.meta.env.DEV && result.immediate && result.user) {
        const user = sanitizeAuthUser(result.user);
        if (!user) throw new Error('Некорректный ответ сервера');
        clearLoggedOutFlag();
        persistSession(user, result.accessToken ?? authApi.readAccessToken());
        set({
          user,
          authModalOpen: false,
          loginPending: false,
          isLoading: false,
          devCode: null,
          devLink: null
        });
        return true;
      }
      set({
        loginPending: true,
        authModalOpen: true,
        devCode: result.devCode ?? null,
        devLink: result.devLink ?? null
      });
      if (result.devLink) {
        console.info('[dev] Magic link:', result.devLink);
      }
      if (result.devCode) {
        console.info('[dev] Login code:', result.devCode);
      }
      return false;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Не удалось отправить письмо' });
      return false;
    }
  },

  verifyCode: async (code) => {
    const email = get().pendingEmail;
    if (!email) {
      set({ error: 'Сначала укажите email' });
      return;
    }
    set({ error: null });
    try {
      const { user: raw } = await authApi.verifyCode(email, code.trim());
      const user = sanitizeAuthUser(raw);
      if (!user) throw new Error('Некорректный ответ сервера');
      clearLoggedOutFlag();
      persistSession(user, authApi.readAccessToken());
      set({
        user,
        authModalOpen: false,
        loginPending: false,
        isLoading: false,
        devCode: null,
        devLink: null,
        error: null
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Неверный код' });
    }
  },

  sendMagicLink: async (email) => {
    await get().requestLogin(email);
  },

  logout: async () => {
    markLoggedOut();
    clearPersistedSession();
    set({
      user: null,
      isLoading: false,
      authModalOpen: false,
      loginPending: false,
      pendingEmail: '',
      devCode: null,
      devLink: null,
      error: null,
      redirectPath: null
    });
    await authApi.logout();
  },

  setUser: (user) => {
    const safe = sanitizeAuthUser(user);
    if (safe) {
      clearLoggedOutFlag();
      persistSession(safe, authApi.readAccessToken());
    }
    set({
      user: safe,
      authModalOpen: false,
      isLoading: false,
      loginPending: false,
      devCode: null,
      devLink: null,
      error: null
    });
  }
}));
