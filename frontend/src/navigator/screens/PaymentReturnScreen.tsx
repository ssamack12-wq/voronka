import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, Loader2, Sparkles, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchPendingPayment,
  readAccessToken,
  waitForPaymentActivation
} from '../../auth/api';
import { clearLoggedOutFlag, ensureApiSession, persistSession } from '../../auth/session';
import { useAuthStore } from '../../auth/store';
import { premiumStatusLabel } from '../engine/planAccess';
import { PageShell, PrimaryButton, SecondaryButton } from '../components/ui';

const PENDING_PAYMENT_KEY = 'tn-pending-payment';

type PaymentUiStatus = 'loading' | 'success' | 'pending' | 'error';

function normalizePlanHint(raw: string | null): 'safe' | 'premium' | undefined {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (value === 'safe' || value === 'premium') return value;
  if (value === 'безопасный') return 'safe';
  if (value === 'премиум') return 'premium';
  return undefined;
}

function readPendingPayment(): { paymentId?: string; plan?: string } | null {
  try {
    const raw =
      sessionStorage.getItem(PENDING_PAYMENT_KEY) ?? localStorage.getItem(PENDING_PAYMENT_KEY);
    return raw ? (JSON.parse(raw) as { paymentId?: string; plan?: string }) : null;
  } catch {
    return null;
  }
}

function clearPendingPayment() {
  try {
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    localStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    /* ignore */
  }
}

async function resolvePaymentContext(
  params: URLSearchParams
): Promise<{ paymentId: string; planHint?: 'safe' | 'premium' }> {
  const stored = readPendingPayment();
  const fromParams = params.get('paymentId')?.trim() ?? '';
  const planFromParams = normalizePlanHint(params.get('plan'));
  const planFromStorage = normalizePlanHint(stored?.plan ?? null);

  let paymentId = stored?.paymentId?.trim() || fromParams;
  let planHint = planFromStorage ?? planFromParams;

  if (!paymentId) {
    const fromServer = await fetchPendingPayment();
    if (fromServer) {
      paymentId = fromServer.paymentId;
      planHint = planHint ?? fromServer.plan;
    }
  }

  return { paymentId, planHint };
}

const StatusIcon: React.FC<{ status: PaymentUiStatus }> = ({ status }) => {
  const base =
    'w-20 h-20 rounded-card flex items-center justify-center shadow-card';

  if (status === 'loading') {
    return (
      <div className={`${base} bg-white`}>
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }
  if (status === 'success') {
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className={`${base} bg-gradient-to-br from-emerald-50 to-white`}
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2.2} />
      </motion.div>
    );
  }
  if (status === 'pending') {
    return (
      <div className={`${base} bg-gradient-to-br from-amber-50 to-white`}>
        <Clock3 className="w-10 h-10 text-amber-600" strokeWidth={2.2} />
      </div>
    );
  }
  return (
    <div className={`${base} bg-gradient-to-br from-red-50 to-white`}>
      <XCircle className="w-10 h-10 text-risk" strokeWidth={2.2} />
    </div>
  );
};

export const PaymentReturnScreen: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, checkSession } = useAuthStore();
  const [status, setStatus] = useState<PaymentUiStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        clearLoggedOutFlag();
        await checkSession();
        const sessionUser = await ensureApiSession();
        if (!sessionUser) {
          setStatus('error');
          setMessage(
            'Сессия не найдена. Войдите по email и откройте профиль — тариф активируется автоматически.'
          );
          return;
        }

        const { paymentId, planHint } = await resolvePaymentContext(params);

        if (!paymentId) {
          setStatus('error');
          setMessage(
            'Не найден платёж для активации. Откройте профиль — если оплата прошла, тариф подтянется с сервера.'
          );
          return;
        }

        const result = await waitForPaymentActivation(paymentId, planHint);
        clearLoggedOutFlag();
        persistSession(result.user, readAccessToken());
        setUser(result.user);
        setActivatedPlan(
          result.user.premiumStatus === 'safe' || result.user.premiumStatus === 'premium'
            ? premiumStatusLabel(result.user.premiumStatus)
            : planHint
              ? premiumStatusLabel(planHint)
              : (params.get('plan') ?? result.plan ?? null)
        );
        clearPendingPayment();
        setStatus('success');
      } catch (e) {
        const err = e as Error;
        if (err.message.includes('обрабатывается')) {
          setStatus('pending');
          setMessage(err.message);
          return;
        }
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Не удалось проверить оплату');
      }
    };

    void run();
  }, [params, setUser, checkSession]);

  const title =
    status === 'loading'
      ? 'Проверяем оплату'
      : status === 'success'
        ? 'Оплата прошла!'
        : status === 'pending'
          ? 'Ждём подтверждение'
          : 'Оплата не завершена';

  const subtitle =
    status === 'loading'
      ? 'Активируем тариф на вашем аккаунте. Обычно это занимает несколько секунд.'
      : status === 'success'
        ? activatedPlan
          ? `Тариф «${activatedPlan}» подключён. Все функции уже доступны в навигаторе.`
          : 'Тариф подключён. Можно продолжить работу со сделкой.'
        : status === 'pending'
          ? message
          : message;

  return (
    <PageShell noPadding className="min-h-[100dvh] bg-gradient-to-b from-slate-50 via-white to-accent-soft/20">
      <div className="flex flex-col flex-1 px-4 pt-10 pb-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col flex-1 items-center text-center"
          >
            <div className="mb-6">
              <StatusIcon status={status} />
            </div>

            <h1 className="text-section-title text-2xl">{title}</h1>
            {subtitle && (
              <p className="mt-3 text-sm text-graphite-muted leading-relaxed max-w-[20rem]">
                {subtitle}
              </p>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12 }}
                className="mt-5 w-full card-premium bg-gradient-to-r from-accent-soft/80 to-white text-left"
              >
                <div className="feature-row">
                  <Sparkles className="w-5 h-5 text-accent feature-row__icon" />
                  <p className="feature-row__content text-small text-graphite leading-snug text-safe">
                  Подписка действует 30 дней. Управление тарифом — в разделе «Профиль».
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mt-auto w-full pt-10 space-y-2.5">
              {status === 'loading' && (
                <div className="flex justify-center gap-1.5 py-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent/70"
                      animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}

              {status === 'success' && (
                <>
                  <PrimaryButton onClick={() => navigate('/app/deal')}>К моей сделке</PrimaryButton>
                  <SecondaryButton onClick={() => navigate('/app/profile')}>
                    К профилю
                  </SecondaryButton>
                </>
              )}

              {status === 'pending' && (
                <>
                  <PrimaryButton onClick={() => window.location.reload()}>
                    Обновить статус
                  </PrimaryButton>
                  <SecondaryButton onClick={() => navigate('/app/profile')}>
                    Открыть профиль
                  </SecondaryButton>
                </>
              )}

              {status === 'error' && (
                <>
                  <PrimaryButton onClick={() => navigate('/app/profile')}>
                    Перейти в профиль
                  </PrimaryButton>
                  <SecondaryButton onClick={() => navigate('/app/subscription/safe')}>
                    Попробовать снова
                  </SecondaryButton>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full py-2 text-sm text-graphite-muted font-medium"
                  >
                    На главную
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageShell>
  );
};
