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
      <div className="page-content space-y-5 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card-premium bg-gradient-to-br ${plan.accent}`}
        >
          <div className="feature-row">
            <div className="feature-row__icon">
              <div className="w-14 h-14 rounded-card bg-white/90 flex items-center justify-center shadow-soft">
                <PlanTierIcon planId={plan.id} className="w-7 h-7 text-accent" />
              </div>
            </div>
            <div className="feature-row__content text-safe">
              <p className="badge-eyebrow mb-1">Тариф</p>
              <h1 className="text-h2 text-graphite mt-0.5 text-safe">{plan.name}</h1>
              <p className="text-small text-graphite-muted mt-1 text-safe">{plan.tagline}</p>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-h2 text-graphite tracking-tight text-safe">{plan.priceLabel}</p>
              {plan.priceNote && (
                <p className="text-small text-graphite-muted mt-1 text-safe">{plan.priceNote}</p>
              )}
            </div>
            {isActive && (
              <span className="shrink-0 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-medium">
                Ваш тариф
              </span>
            )}
          </div>
        </motion.div>

        {plan.highlights.map((h) => (
          <Card key={h} className="bg-accent-soft/25">
            <div className="feature-row">
              <Sparkles className="w-5 h-5 text-accent shrink-0 feature-row__icon" />
              <p className="feature-row__content text-body text-graphite leading-relaxed text-safe">{h}</p>
            </div>
          </Card>
        ))}

        <div>
          <h2 className="text-body font-medium text-graphite mb-3 text-safe">Что входит</h2>
          <ul className="card-list">
            {plan.features.map((f) => (
              <li key={f} className="checklist-card feature-row checklist-card--compact">
                <Check className="w-5 h-5 text-accent shrink-0 feature-row__icon mt-0.5" />
                <span className="feature-row__content text-body text-graphite leading-snug text-safe">{f}</span>
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
          <h2 className="text-sm font-medium text-graphite-muted mb-2">Другие тарифы</h2>
          <div className="space-y-2">
            {otherPlans.map((id) => {
              const other = SUBSCRIPTION_PLANS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(`/app/subscription/${id}`)}
                  className="card-premium-interactive w-full text-left active:scale-[0.99] min-w-0"
                >
                  <div className="feature-row">
                    <PlanTierIcon planId={other.id} className="w-5 h-5 text-accent feature-row__icon" />
                    <div className="feature-row__content text-safe">
                      <p className="feature-row__title font-semibold">{other.name}</p>
                      <p className="feature-row__description">{other.tagline}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-graphite-muted feature-row__trailing" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
};
