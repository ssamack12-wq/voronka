import type { AuthUser, PremiumStatus } from './types';

const PREMIUM_STATUSES: PremiumStatus[] = ['free', 'safe', 'premium', 'expired', 'admin'];

export function sanitizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const u = raw as Record<string, unknown>;
  const id = typeof u.id === 'string' ? u.id : '';
  const email = typeof u.email === 'string' ? u.email.trim().toLowerCase() : '';
  if (!id || !email || !email.includes('@')) return null;
  const premiumRaw = typeof u.premiumStatus === 'string' ? u.premiumStatus : 'free';
  const premiumStatus = PREMIUM_STATUSES.includes(premiumRaw as PremiumStatus)
    ? (premiumRaw as PremiumStatus)
    : 'free';
  const createdAt =
    typeof u.createdAt === 'string' ? u.createdAt : new Date().toISOString();
  return { id, email, premiumStatus, createdAt };
}
