import type { PremiumStatus } from '../../auth/types';
import type { AuthUser } from '../../auth/types';
import type { PlanTier } from '../types';

const ADMIN_EMAIL = 'gartem2109@yandex.ru';
const ADMIN_USER_ID = '2ff0cfc1-796e-4fc6-8efc-59f84aa31bbb';

export function isAppAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  const email = user.email.trim().toLowerCase();
  return email === ADMIN_EMAIL || user.id === ADMIN_USER_ID;
}

export function premiumStatusToPlanTier(status: PremiumStatus | undefined): PlanTier {
  if (status === 'premium' || status === 'admin') return 'premium';
  if (status === 'safe') return 'safe';
  return 'base';
}

export function premiumStatusLabel(status: PremiumStatus | undefined): string {
  const map: Record<PremiumStatus, string> = {
    free: 'Базовый (бесплатно)',
    safe: 'Безопасный',
    premium: 'Премиум',
    expired: 'Истекла',
    admin: 'Администратор'
  };
  return map[status ?? 'free'] ?? 'Базовый';
}

/** Тариф доступа: с сервера для авторизованных, иначе base. */
export function resolveEffectivePlan(
  user: AuthUser | null | undefined,
  progress?: { plan?: PlanTier; isPremium?: boolean } | null
): PlanTier {
  if (user) return premiumStatusToPlanTier(user.premiumStatus);
  return normalizePlan(progress);
}

export function normalizePlan(
  progress: { plan?: PlanTier; isPremium?: boolean } | null | undefined
): PlanTier {
  if (progress?.plan) return progress.plan;
  if (progress?.isPremium) return 'premium';
  return 'base';
}

export function canAccessTutorials(plan: PlanTier): boolean {
  return plan === 'safe' || plan === 'premium';
}

export function canAccessFullRiskEngine(plan: PlanTier): boolean {
  return plan === 'safe' || plan === 'premium';
}

export function canAccessPremiumFeatures(plan: PlanTier): boolean {
  return plan === 'premium';
}

export function canAccessDealCalendar(plan: PlanTier): boolean {
  return plan === 'safe' || plan === 'premium';
}

export function canAccessEmergencyScenarios(plan: PlanTier): boolean {
  return plan === 'safe' || plan === 'premium';
}

export function planLabel(plan: PlanTier): string {
  const map: Record<PlanTier, string> = {
    base: 'Базовый',
    safe: 'Безопасный',
    premium: 'Премиум'
  };
  return map[plan];
}
