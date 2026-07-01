import { API_BASE, apiUrl, isApiConfigured } from '../config/api';
import type { DealProgress } from '../navigator/types';
import { clearLoggedOutFlag, isLoggedOutLocally, markLoggedOut } from './sessionFlags';
import { sanitizeAuthUser } from './sanitizeUser';
import type { AuthUser, PremiumStatus } from './types';

function serializeJsonBody(body: unknown): string {
  return JSON.stringify(body);
}

export function storeAccessToken(token: string | null) {
  const storage = readStorage();
  if (!storage) return;
  try {
    if (token) storage.setItem(ACCESS_TOKEN_KEY, token);
    else storage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function readAccessToken(): string | null {
  const storage = readStorage();
  if (!storage) return null;
  try {
    return storage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function hasAccessToken(): boolean {
  return Boolean(readAccessToken());
}

const SESSION_BUNDLE_KEY = 'tn-session-bundle';
const SESSION_USER_KEY = 'tn-session-user';
const ACCESS_TOKEN_KEY = 'tn-access-token';

function persistAuthResponse(data: unknown, requestPath: string) {
  if (!data || typeof data !== 'object') return;
  const d = data as { accessToken?: unknown; user?: unknown };
  if (requestPath.includes('/api/auth/logout')) {
    clearAllLocalAuth();
    return;
  }
  if ('user' in d && d.user === null) {
    return;
  }
  const tokenFromBody = typeof d.accessToken === 'string' ? d.accessToken : '';
  if (tokenFromBody) storeAccessToken(tokenFromBody);
  const token = readAccessToken();
  const user = sanitizeAuthUser(d.user);
  if (!user || !token) return;
  clearLoggedOutFlag();
  cacheSessionUser(user);
  const storage = readStorage();
  if (!storage) return;
  try {
    storage.setItem(SESSION_BUNDLE_KEY, JSON.stringify({ user, accessToken: token }));
  } catch {
    /* ignore */
  }
}

export function clearAllLocalAuth() {
  cacheSessionUser(null);
  storeAccessToken(null);
  const storage = readStorage();
  if (!storage) return;
  try {
    storage.removeItem(SESSION_BUNDLE_KEY);
    storage.removeItem(SESSION_USER_KEY);
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem('tn-pending-payment');
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem('tn-pending-payment');
  } catch {
    /* ignore */
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl(path);
  const { body, headers: initHeaders, ...rest } = init ?? {};
  const serializedBody =
    body === undefined ? undefined : typeof body === 'string' ? body : serializeJsonBody(body);
  const bearer = readAccessToken();

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...(initHeaders ?? {})
      },
      body: serializedBody
    });
  } catch (err) {
    const hint = isApiConfigured()
      ? `Не удалось связаться с API (${API_BASE}). Проверьте CORS: FRONTEND_URL на бэкенде = URL этого сайта.`
      : 'Не задан URL API. На Railway (frontend): API_URL или VITE_API_URL = URL бэкенда, затем Redeploy.';
    throw new Error(hint);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    const err = new Error(
      (data as { error?: string }).error ?? `Ошибка запроса (${res.status})`
    ) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  if (!isJson) {
    throw new Error(
      `API вернул не JSON (${url}). ` +
        (isApiConfigured()
          ? `Проверьте, что ${API_BASE} — это бэкенд, а не фронт.`
          : 'Задайте API_URL на URL бэкенда в Railway (сервис frontend).')
    );
  }

  persistAuthResponse(data, path);
  return data as T;
}

function readStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

export function cacheSessionUser(user: AuthUser | null) {
  const storage = readStorage();
  if (!storage) return;
  try {
    const safe = user ? sanitizeAuthUser(user) : null;
    if (safe) storage.setItem(SESSION_USER_KEY, JSON.stringify(safe));
    else storage.removeItem(SESSION_USER_KEY);
  } catch {
    /* ignore */
  }
}

export function readCachedSessionUser(): AuthUser | null {
  const storage = readStorage();
  if (!storage) return null;
  try {
    let raw = storage.getItem(SESSION_USER_KEY);
    if (!raw) {
      try {
        const legacy = sessionStorage.getItem(SESSION_USER_KEY);
        if (legacy) {
          storage.setItem(SESSION_USER_KEY, legacy);
          sessionStorage.removeItem(SESSION_USER_KEY);
          raw = legacy;
        }
      } catch {
        /* ignore */
      }
    }
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

class SessionExpiredError extends Error {
  constructor() {
    super('Сессия истекла');
    this.name = 'SessionExpiredError';
  }
}

async function refreshSessionFromServer(): Promise<AuthUser | null> {
  try {
    const data = await request<{ ok: boolean; user: AuthUser; accessToken?: string }>(
      '/api/auth/refresh',
      {
        method: 'POST'
      }
    );
    return sanitizeAuthUser(data.user);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) throw new SessionExpiredError();
    throw err;
  }
}

export async function fetchSession(): Promise<{ user: AuthUser | null }> {
  if (isLoggedOutLocally()) {
    return { user: null };
  }

  try {
    const data = await request<{ user: AuthUser | null; accessToken?: string }>('/api/auth/me');
    const fromMe = sanitizeAuthUser(data.user);
    if (fromMe) {
      clearLoggedOutFlag();
      cacheSessionUser(fromMe);
      return { user: fromMe };
    }
  } catch {
    /* пробуем refresh ниже */
  }

  const hadToken = Boolean(readAccessToken());
  if (!hadToken) {
    return { user: null };
  }

  try {
    const fromRefresh = await refreshSessionFromServer();
    if (fromRefresh) {
      clearLoggedOutFlag();
      cacheSessionUser(fromRefresh);
      return { user: fromRefresh };
    }
  } catch (err) {
    if (err instanceof SessionExpiredError) {
      cacheSessionUser(null);
      storeAccessToken(null);
    }
  }

  cacheSessionUser(null);
  storeAccessToken(null);
  return { user: null };
}

export async function refreshSession(): Promise<AuthUser | null> {
  try {
    const user = await refreshSessionFromServer();
    if (user) cacheSessionUser(user);
    return user;
  } catch (err) {
    if (err instanceof SessionExpiredError) {
      cacheSessionUser(null);
      storeAccessToken(null);
    }
    return null;
  }
}

export interface LoginRequestResult {
  ok: boolean;
  immediate?: boolean;
  emailSent?: boolean;
  user?: AuthUser;
  accessToken?: string;
  devLink?: string;
  devCode?: string;
}

function isValidLoginResponse(data: unknown): data is LoginRequestResult {
  if (!data || typeof data !== 'object') return false;
  const d = data as LoginRequestResult;
  if (d.ok !== true) return false;
  if (d.immediate === true && d.user) return true;
  if (d.emailSent === true) return true;
  if (typeof d.devCode === 'string' && d.devCode.length > 0) return true;
  return false;
}

export async function requestLogin(email: string): Promise<LoginRequestResult> {
  if (!isApiConfigured() && import.meta.env.PROD) {
    throw new Error(
      'URL API не задан. Railway → сервис frontend → Variables: API_URL=https://ваш-backend.up.railway.app (или VITE_API_URL при сборке) → Redeploy.'
    );
  }

  const data = await request<LoginRequestResult>('/api/auth/request', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

  if (!isValidLoginResponse(data)) {
    throw new Error(
      `Некорректный ответ API (${apiUrl('/api/auth/request')}). ` +
        `Ответ: ${JSON.stringify(data).slice(0, 120)}`
    );
  }

  return data;
}

/** @deprecated используйте requestLogin */
export async function sendMagicLink(email: string): Promise<LoginRequestResult> {
  return requestLogin(email);
}

export async function verifyCode(
  email: string,
  code: string
): Promise<{ ok: boolean; user: AuthUser; accessToken?: string }> {
  const data = await request<{ ok: boolean; user: AuthUser; accessToken?: string }>(
    '/api/auth/verify-code',
    {
      method: 'POST',
      body: JSON.stringify({ email, code })
    }
  );
  const user = sanitizeAuthUser(data.user);
  if (!user) {
    throw new Error('Некорректный ответ сервера');
  }
  return { ok: data.ok, user };
}

export async function verifyMagicToken(token: string): Promise<{ user: AuthUser; accessToken?: string }> {
  const safeToken = String(token ?? '').trim();
  if (!safeToken) {
    throw new Error('Ссылка недействительна');
  }
  const data = await request<{ user: AuthUser; accessToken?: string }>('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token: safeToken })
  });
  const user = sanitizeAuthUser(data.user);
  if (!user) {
    throw new Error('Некорректный ответ сервера');
  }
  return { user };
}

export async function logout(): Promise<void> {
  markLoggedOut();
  clearAllLocalAuth();
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } catch {
    /* cookies may already be cleared */
  } finally {
    clearAllLocalAuth();
  }
}

export async function syncDealProgress(
  payload: DealProgress | null
): Promise<{ ok: boolean }> {
  if (!payload) {
    return request('/api/deals/progress', { method: 'DELETE' });
  }
  return request('/api/deals/progress', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteDealProgress(dealId: string): Promise<{ ok: boolean }> {
  const q = `?dealId=${encodeURIComponent(dealId)}`;
  return request(`/api/deals/progress${q}`, { method: 'DELETE' });
}

export async function loadDealProgress(dealId?: string): Promise<DealProgress | null> {
  const q = dealId ? `?dealId=${encodeURIComponent(dealId)}` : '';
  const data = await request<{ progress: DealProgress | null }>(`/api/deals/progress${q}`);
  return data.progress;
}

export async function listDeals(): Promise<{ deals: DealProgress[] }> {
  return request('/api/deals');
}

export interface ConsultationPayload {
  dealId?: string;
  scenarioId?: string;
  stepId?: string;
  needType: string;
  message: string;
  phone?: string;
  email?: string;
}

export async function submitConsultation(payload: ConsultationPayload): Promise<{ ok: boolean }> {
  return request('/api/consultations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export interface QuizLeadPayload {
  phone: string;
  city: string;
  type: string;
  readiness: number;
  riskScore?: number;
  answers?: unknown[];
}

export async function submitQuizLead(payload: QuizLeadPayload): Promise<{ ok: boolean }> {
  return request('/api/lead', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      readiness: String(payload.readiness),
      riskScore: payload.riskScore != null ? String(payload.riskScore) : ''
    })
  });
}

export interface PaymentConfig {
  enabled: boolean;
  plans: {
    safe: { amount: string; currency: string };
    premium: { amount: string; currency: string };
  };
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  return request('/api/payments/config');
}

export async function createYookassaPayment(
  plan: 'safe' | 'premium'
): Promise<{ confirmationUrl: string; paymentId: string; amount: string; plan: string }> {
  return request('/api/payments/create', {
    method: 'POST',
    body: JSON.stringify({ plan })
  });
}

export async function fetchPendingPayment(): Promise<{
  paymentId: string;
  plan: 'safe' | 'premium';
} | null> {
  const data = await request<{
    ok: boolean;
    pending: { paymentId: string; plan: string } | null;
  }>('/api/payments/pending');
  const pending = data.pending;
  if (!pending?.paymentId) return null;
  if (pending.plan === 'safe' || pending.plan === 'premium') {
    return { paymentId: pending.paymentId, plan: pending.plan };
  }
  return { paymentId: pending.paymentId, plan: 'safe' };
}

export async function fetchAdminAccess(): Promise<{ isAdmin: boolean }> {
  const data = await request<{ ok: boolean; isAdmin: boolean }>('/api/admin/me');
  return { isAdmin: Boolean(data.isAdmin) };
}

export async function adminSearchUsers(query: string): Promise<AuthUser[]> {
  const q = query.trim();
  const path = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : '/api/admin/users';
  const data = await request<{ ok: boolean; users: AuthUser[] }>(path);
  return (data.users ?? []).map((u) => sanitizeAuthUser(u)).filter(Boolean) as AuthUser[];
}

export async function adminSetSubscription(
  userId: string,
  premiumStatus: PremiumStatus
): Promise<AuthUser> {
  const data = await request<{ ok: boolean; user: AuthUser }>(
    `/api/admin/users/${encodeURIComponent(userId)}/subscription`,
    {
      method: 'PATCH',
      body: JSON.stringify({ premiumStatus })
    }
  );
  const user = sanitizeAuthUser(data.user);
  if (!user) throw new Error('Некорректный ответ сервера');
  return user;
}

export async function adminDeleteUser(userId: string): Promise<void> {
  await request(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
}

export async function getPaymentStatus(paymentId: string): Promise<{
  status: string;
  plan: string | null;
  applied: { plan: string; user: AuthUser | null } | null;
  user: AuthUser;
}> {
  return request(`/api/payments/${encodeURIComponent(paymentId)}`);
}

const PAYMENT_COMPLETE = new Set(['succeeded', 'waiting_for_capture']);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function confirmPayment(
  paymentId?: string,
  plan?: 'safe' | 'premium'
): Promise<{
  status: string;
  plan: string | null;
  pending?: boolean;
  activated?: boolean;
  user: AuthUser;
}> {
  const body: { paymentId?: string; plan?: string } = {};
  if (paymentId) body.paymentId = paymentId;
  if (plan) body.plan = plan;

  const data = await request<{
    ok: boolean;
    status: string;
    plan: string | null;
    pending?: boolean;
    activated?: boolean;
    user: AuthUser;
  }>('/api/payments/confirm', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  const user = sanitizeAuthUser(data.user);
  if (!user) throw new Error('Некорректный ответ сервера');
  if (data.activated || (!data.pending && user.premiumStatus !== 'free')) {
    clearLoggedOutFlag();
  }
  return {
    status: data.status,
    plan: data.plan,
    pending: data.pending,
    activated: data.activated,
    user
  };
}

/** Ожидает подтверждение ЮKassa и принудительно активирует тариф на сервере. */
export async function waitForPaymentActivation(
  paymentId: string,
  planHint?: 'safe' | 'premium',
  maxAttempts = 12
): Promise<{
  status: string;
  plan: string | null;
  user: AuthUser;
}> {
  let lastPending: { status: string; plan: string | null; user: AuthUser } | null = null;

  const expectedPlan = planHint ?? undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await confirmPayment(paymentId, planHint);
      if (!result.pending && PAYMENT_COMPLETE.has(result.status)) {
        const activated =
          result.activated === true ||
          (expectedPlan
            ? result.user.premiumStatus === expectedPlan
            : result.user.premiumStatus === 'safe' ||
              result.user.premiumStatus === 'premium');
        if (activated) {
          return { status: result.status, plan: result.plan, user: result.user };
        }
        throw new Error('Оплата подтверждена, но тариф на аккаунте не обновился');
      }
      lastPending = result;
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 400 || err.status === 403 || err.status === 500) throw err;
    }

    if (attempt < maxAttempts - 1) {
      await sleep(attempt < 4 ? 1500 : 2500);
    }
  }

  if (lastPending) {
    throw new Error('Платёж ещё обрабатывается. Обновите страницу через минуту.');
  }

  throw new Error('Не удалось подтвердить оплату');
}
