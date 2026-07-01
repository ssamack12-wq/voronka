import { motion } from 'framer-motion';
import { Check, ChevronRight, Crown, Home, Shield, Sparkles } from 'lucide-react';
import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../auth/store';
import {
  SUBSCRIPTION_PLANS,
  planIdFromTier,
  tierFromPlanId,
  type SubscriptionPlanId
} from '../data/subscriptionPlans';
import { resolveEffectivePlan } from '../engine/planAccess';
import { useYookassaPay } from '../hooks/useYookassaPay';
import { useNavigator } from '../store/NavigatorContext';
import { Header } from '../components/Header';
import { Card, PageShell, PrimaryButton, SecondaryButton } from '../components/ui';

const PlanTierIcon: React.FC<{
  planId: SubscriptionPlanId;
  className?: string;
}> = ({ planId, className = 'w-6 h-6' }) => {
  if (planId === 'safe') return <Shield className={className} />;
  if (planId === 'premium') return <Crown className={className} />;
  return <Home className={className} />;
};

export const SubscriptionPlanScreen: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuthStore();
  const { progress } = useNavigator();
  const { startPayment, loading, error } = useYookassaPay();

  const tier = tierFromPlanId(planId ?? '');
  const plan = tier ? SUBSCRIPTION_PLANS[tier] : null;
  const effective = resolveEffectivePlan(user, progress);
  const isActive = plan ? planIdFromTier(effective) === plan.id : false;

  if (!plan) {
    return <Navigate to="/app/profile" replace />;
  }

  const otherPlans = (['base', 'safe', 'premium'] as SubscriptionPlanId[]).filter(
    (id) => id !== plan.id
  );

  return (
    <PageShell noPadding className="overflow-y-auto overflow-x-hidden pb-8 min-w-0">
      <Header title={plan.name} onBack={() => navigate('/app/profile')} />
      <div className="px-4 space-y-5 min-w-0 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border bg-gradient-to-br p-5 shadow-soft ${plan.accent}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/90 border border-white flex items-center justify-center shadow-sm shrink-0">
              <PlanTierIcon planId={plan.id} className="w-7 h-7 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-accent uppercase tracking-wide">
                Тариф
              </p>
              <h1 className="text-2xl font-semibold text-graphite mt-0.5">{plan.name}</h1>
              <p className="text-sm text-graphite-muted mt-1">{plan.tagline}</p>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-graphite tracking-tight">{plan.priceLabel}</p>
              {plan.priceNote && (
                <p className="text-xs text-graphite-muted mt-1">{plan.priceNote}</p>
              )}
            </div>
            {isActive && (
              <span className="shrink-0 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-bold">
                Ваш тариф
              </span>
            )}
          </div>
        </motion.div>

        {plan.highlights.map((h) => (
          <Card key={h} className="p-4 border-accent/15 bg-accent-soft/25">
            <div className="flex gap-2">
              <Sparkles className="w-5 h-5 text-accent shrink-0" />
              <p className="text-sm text-graphite leading-relaxed">{h}</p>
            </div>
          </Card>
        ))}

        <div>
          <h2 className="text-sm font-semibold text-graphite mb-3">Что входит</h2>
          <ul className="space-y-2.5">
            {plan.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-soft"
              >
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-graphite leading-snug">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 pt-1">
          {isActive ? (
            <PrimaryButton onClick={() => navigate('/app/deal')}>Перейти к сделке</PrimaryButton>
          ) : plan.payable && plan.paymentPlan ? (
            <>
              <PrimaryButton
                disabled={loading}
                onClick={() => {
                  if (!user) {
                    openAuthModal(`/app/subscription/${plan.id}`);
                    return;
                  }
                  void startPayment(plan.paymentPlan!);
                }}
              >
                {loading ? 'Переход к оплате…' : `Оплатить «${plan.name}» — ${plan.priceLabel}`}
              </PrimaryButton>
              {error && <p className="text-xs text-risk text-center">{error}</p>}
              {!user && (
                <p className="text-xs text-graphite-muted text-center">
                  Для оплаты нужен вход по email
                </p>
              )}
              {plan.payable && (
                <p className="text-xs text-graphite-muted text-center">
                  Подписка на 30 дней. Оплата через ЮKassa.
                </p>
              )}
            </>
          ) : (
            <PrimaryButton onClick={() => navigate('/app/onboarding')}>
              Начать бесплатно
            </PrimaryButton>
          )}
          <SecondaryButton onClick={() => navigate('/app/profile')}>
            Все тарифы
          </SecondaryButton>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-graphite-muted mb-2">Другие тарифы</h2>
          <div className="space-y-2">
            {otherPlans.map((id) => {
              const other = SUBSCRIPTION_PLANS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(`/app/subscription/${id}`)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white text-left active:scale-[0.99] transition-transform"
                >
                  <PlanTierIcon planId={other.id} className="w-5 h-5 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-graphite">{other.name}</p>
                    <p className="text-xs text-graphite-muted truncate">{other.tagline}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-graphite-muted shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
};
