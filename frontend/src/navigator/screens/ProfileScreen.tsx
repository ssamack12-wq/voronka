import { ChevronRight, Crown, Home, Link2, LogIn, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminAccess, fetchPendingPayment, waitForPaymentActivation } from '../../auth/api';
import { useAuthStore } from '../../auth/store';
import { SUBSCRIPTION_PLANS, planIdFromTier } from '../data/subscriptionPlans';
import { Header } from '../components/Header';
import {
  Card,
  GhostButton,
  PageShell,
  PrimaryButton,
  SecondaryButton,
  SectionTitle
} from '../components/ui';
import {
  isAppAdmin,
  planLabel,
  premiumStatusLabel,
  resolveEffectivePlan
} from '../engine/planAccess';
import { useNavigator } from '../store/NavigatorContext';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, openAuthModal, setUser } = useAuthStore();
  const {
    deal,
    progress,
    favorites,
    toggleFavorite,
    resetDeal,
    deleteActiveDeal,
    setDrawerOpen,
    openLeadModal
  } = useNavigator();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [showAdminLink, setShowAdminLink] = useState(false);

  useEffect(() => {
    if (!user || user.premiumStatus === 'safe' || user.premiumStatus === 'premium') return;
    let cancelled = false;
    void (async () => {
      try {
        const pending = await fetchPendingPayment();
        if (!pending || cancelled) return;
        const result = await waitForPaymentActivation(pending.paymentId, pending.plan);
        if (!cancelled) setUser(result.user);
      } catch {
        /* пользователь может обновить страницу оплаты вручную */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, setUser]);

  useEffect(() => {
    if (!isAppAdmin(user)) {
      setShowAdminLink(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const sessionUser = user;
      if (cancelled || !sessionUser || !isAppAdmin(sessionUser)) {
        if (!cancelled) setShowAdminLink(false);
        return;
      }
      try {
        const { isAdmin } = await fetchAdminAccess();
        if (!cancelled) setShowAdminLink(isAdmin);
      } catch {
        if (!cancelled) setShowAdminLink(isAppAdmin(sessionUser));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const effectivePlan = resolveEffectivePlan(user, progress);
  const subscriptionStatus = user?.premiumStatus ?? 'free';
  const activePlanId = planIdFromTier(effectivePlan);
  const favoriteRows = React.useMemo(() => {
    if (!deal || !favorites.length) return [];
    return favorites
      .map((favId) => {
        if (favId.startsWith('step:')) {
          const stepId = favId.slice('step:'.length);
          const step = deal.steps.find((s) => s.id === stepId);
          if (!step) return null;
          return {
            id: favId,
            title: step.title,
            subtitle: 'Этап сделки',
            onOpen: () => navigate(`/app/deal/step/${stepId}`)
          };
        }
        if (favId.startsWith('checklist:')) {
          const [_kind, stepId, itemId] = favId.split(':');
          if (!stepId || !itemId) return null;
          const step = deal.steps.find((s) => s.id === stepId);
          const item = step?.checklist.find((c) => c.id === itemId);
          if (!step || !item) return null;
          return {
            id: favId,
            title: item.title,
            subtitle: step.title,
            onOpen: () => navigate(`/app/deal/step/${stepId}/item/${itemId}`)
          };
        }
        return null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }, [deal, favorites, navigate]);

  return (
    <PageShell noPadding className="overflow-y-auto overflow-x-hidden pb-4 min-w-0">
      <Header logo showMenu onMenu={() => setDrawerOpen(true)} title="Профиль" />
      <div className="px-4 space-y-4 min-w-0 max-w-full">
        <Card className={`p-4 ${effectivePlan !== 'base' ? 'bg-accent-soft border-accent/20' : ''}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
              <span className="text-xl text-graphite-muted">👤</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-graphite truncate">{user?.email ?? 'Гость'}</p>
              <p className="text-xs text-graphite-muted">
                Тариф: {planLabel(effectivePlan)}
                {user && ` · ${premiumStatusLabel(subscriptionStatus)}`}
              </p>
            </div>
            {effectivePlan !== 'base' && <Crown className="w-5 h-5 text-accent shrink-0" />}
          </div>
        </Card>

        {showAdminLink && (
          <PrimaryButton onClick={() => navigate('/app/admin')}>Админ-панель</PrimaryButton>
        )}

        <SectionTitle>Тарифы</SectionTitle>
        <p className="text-xs text-graphite-muted -mt-2">
          Подробности и оплата — на экране каждого тарифа. Смена только после оплаты в ЮKassa.
        </p>

        {(['base', 'safe', 'premium'] as const).map((id) => {
          const plan = SUBSCRIPTION_PLANS[id];
          const active = activePlanId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigate(`/app/subscription/${id}`)}
              className={`w-full text-left rounded-2xl border p-4 transition-colors active:scale-[0.99] min-w-0 ${
                active
                  ? 'border-accent/35 bg-accent-soft/35'
                  : 'border-gray-100 bg-white shadow-soft'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <PlanTierIcon planId={id} className="w-6 h-6 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-graphite">{plan.name}</p>
                    {active && (
                      <span className="text-[10px] font-bold text-accent uppercase">Активен</span>
                    )}
                  </div>
                  <p className="text-xs text-graphite-muted mt-0.5 truncate">{plan.tagline}</p>
                  <p className="text-xs font-medium text-graphite mt-1">{plan.priceLabel}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-graphite-muted shrink-0" />
              </div>
            </button>
          );
        })}

        <SectionTitle>Избранное</SectionTitle>
        {favoriteRows.length > 0 ? (
          <div className="space-y-2">
            {favoriteRows.map((row) => (
              <Card key={row.id} className="p-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={row.onOpen}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm font-medium text-graphite truncate">{row.title}</p>
                    <p className="text-xs text-graphite-muted truncate mt-0.5">{row.subtitle}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(row.id)}
                    className="text-xs font-medium text-risk px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Убрать
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4">
            <p className="text-sm text-graphite-muted">
              Пока пусто. Сохраняйте этапы и пункты чек-листа кнопкой закладки.
            </p>
          </Card>
        )}

        <SectionTitle>Доступ</SectionTitle>
        <PlaceholderRow
          icon={LogIn}
          title="Вход по email"
          desc="Без пароля — код или ссылка из письма."
          action={
            !user ? (
              <PrimaryButton className="mt-3 !py-2.5 text-sm" onClick={() => openAuthModal('/app/profile')}>
                Войти
              </PrimaryButton>
            ) : (
              <GhostButton
                onClick={() => {
                  void logout().then(() => navigate('/app/onboarding'));
                }}
              >
                Выйти
              </GhostButton>
            )
          }
        />
        <PlaceholderRow
          icon={Link2}
          title="Консультации"
          desc="Заявка юристу или риелтору."
          action={
            <SecondaryButton className="mt-3 !py-2.5 text-sm" onClick={openLeadModal}>
              Получить консультацию
            </SecondaryButton>
          }
        />

        {progress && (
          <div className="space-y-2">
            <GhostButton onClick={resetDeal}>Начать новую сделку</GhostButton>
            {confirmDelete ? (
              <Card className="p-4 border-risk/20 bg-red-50/50">
                <p className="text-sm text-graphite mb-3">
                  Удалить текущую сделку «{progress.displayTitle ?? 'Сделка'}»?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteActiveDeal();
                      setConfirmDelete(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-risk text-white text-sm font-semibold"
                  >
                    Удалить
                  </button>
                </div>
              </Card>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-3 text-sm font-medium text-risk"
              >
                Удалить текущую сделку
              </button>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};

const PlanTierIcon: React.FC<{
  planId: 'base' | 'safe' | 'premium';
  className?: string;
}> = ({ planId, className = 'w-6 h-6' }) => {
  if (planId === 'safe') return <Shield className={className} />;
  if (planId === 'premium') return <Crown className={className} />;
  return <Home className={className} />;
};

const PlaceholderRow: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  desc: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, desc, action }) => (
  <Card className="p-4 min-w-0 overflow-hidden">
    <div className="flex gap-3 min-w-0">
      <Icon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-graphite text-sm">{title}</p>
        <p className="text-xs text-graphite-muted mt-1">{desc}</p>
        {action}
      </div>
    </div>
  </Card>
);
