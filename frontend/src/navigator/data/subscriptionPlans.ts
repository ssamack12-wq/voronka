import type { PlanTier } from '../types';

export type SubscriptionPlanId = 'base' | 'safe' | 'premium';

export interface SubscriptionPlanInfo {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceNote?: string;
  accent: string;
  features: string[];
  highlights: string[];
  payable: boolean;
  paymentPlan?: 'safe' | 'premium';
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlanInfo> = {
  base: {
    id: 'base',
    name: 'Базовый',
    tagline: 'Старт сделки без оплаты',
    priceLabel: 'Бесплатно',
    accent: 'from-slate-50 to-white border-slate-200',
    features: [
      'Персональный план сделки по ответам квиза',
      'Этапы, чеклисты и контроль прогресса',
      'Базовый разбор рисков по сделке',
      'Заявка на консультацию юриста или риелтора'
    ],
    highlights: ['Идеально, чтобы начать и понять объём работ'],
    payable: false
  },
  safe: {
    id: 'safe',
    name: 'Безопасный',
    tagline: 'Полные инструкции и разбор рисков',
    priceLabel: '690 ₽',
    priceNote: 'подписка на 30 дней',
    accent: 'from-accent-soft/80 to-white border-accent/25',
    features: [
      'Всё из тарифа «Базовый»',
      'Календарь сделки с временной шкалой',
      'Экстренные сценарии «Что делать если…»',
      'Пошаговые инструкции по каждому этапу',
      'Предупреждения и «красные флаги»',
      'Полный движок оценки рисков',
      'Частые ошибки и что проверить',
      'Ссылки на официальные ресурсы'
    ],
    highlights: ['Рекомендуем при ипотеке, опеке, альтернативе и сложных сделках'],
    payable: true,
    paymentPlan: 'safe'
  },
  premium: {
    id: 'premium',
    name: 'Премиум',
    tagline: 'Максимум инструментов для сделки',
    priceLabel: '990 ₽',
    priceNote: 'подписка на 30 дней',
    accent: 'from-amber-50/90 to-white border-amber-200/80',
    features: [
      'Всё из тарифа «Безопасный»',
      'Генерация документов (скоро)',
      'Ручная проверка сделки менеджером'
    ],
    highlights: ['Для сделок, где нужен полный комплект инструментов'],
    payable: true,
    paymentPlan: 'premium'
  }
};

export function planIdFromTier(tier: PlanTier): SubscriptionPlanId {
  if (tier === 'safe') return 'safe';
  if (tier === 'premium') return 'premium';
  return 'base';
}

export function tierFromPlanId(id: string): PlanTier | null {
  if (id === 'base' || id === 'safe' || id === 'premium') return id;
  return null;
}
