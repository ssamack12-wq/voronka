import { AnimatePresence, motion } from 'framer-motion';
import { Check, Crown, Shield, X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTutorial } from '../data/tutorials';
import { SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { planLabel } from '../engine/planAccess';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import type { PlanTier } from '../types';
import { useYookassaPay } from '../hooks/useYookassaPay';

interface PlanPaywallProps {
  open: boolean;
  tutorialId: string | null;
  targetPlan: 'safe' | 'premium';
  onClose: () => void;
}

export const PlanPaywall: React.FC<PlanPaywallProps> = ({
  open,
  tutorialId,
  targetPlan,
  onClose
}) => {
  const navigate = useNavigate();
  const { startPayment, loading, error } = useYookassaPay();
  const tutorial = tutorialId ? getTutorial(tutorialId) : null;
  const planInfo = SUBSCRIPTION_PLANS[targetPlan];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-card max-h-[90vh] overflow-y-auto overflow-x-hidden">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-graphite-muted" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
                {targetPlan === 'premium' ? (
                  <Crown className="w-7 h-7 text-accent" />
                ) : (
                  <Shield className="w-7 h-7 text-accent" />
                )}
              </div>

              <h2 className="text-xl font-semibold text-graphite pr-8">
                {targetPlan === 'safe'
                  ? 'Инструкции доступны в тарифе «Безопасный»'
                  : 'Тариф «Премиум» — расширенные возможности'}
              </h2>
              {tutorial && (
                <p className="text-sm text-graphite-muted mt-2">{tutorial.title}</p>
              )}
              <p className="text-sm text-graphite-muted mt-3 leading-relaxed">
                На тарифе «Базовый» доступны план сделки и чеклисты. Тариф «{planLabel(targetPlan)}»
                открывает подробные материалы и полный разбор рисков.
              </p>

              <ul className="mt-5 space-y-2.5">
                {planInfo.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-graphite">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                <PrimaryButton
                  disabled={loading}
                  onClick={() => void startPayment(targetPlan)}
                >
                  {loading
                    ? 'Переход к оплате…'
                    : `Оплатить «${planInfo.name}» — ${planInfo.priceLabel}`}
                </PrimaryButton>
                {error && <p className="text-xs text-risk text-center">{error}</p>}
                <SecondaryButton onClick={() => navigate(`/app/subscription/${targetPlan}`)}>
                  Подробнее о тарифе
                </SecondaryButton>
                {targetPlan === 'premium' && (
                  <SecondaryButton disabled={loading} onClick={() => void startPayment('safe')}>
                    Только «Безопасный» — {SUBSCRIPTION_PLANS.safe.priceLabel}
                  </SecondaryButton>
                )}
                <SecondaryButton onClick={() => navigate('/app/lead')}>
                  Нужна помощь специалиста
                </SecondaryButton>
                <p className="text-center text-[11px] text-graphite-muted pt-1">
                  Подписка на 30 дней. Оплата через ЮKassa. Нужен вход в аккаунт.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
