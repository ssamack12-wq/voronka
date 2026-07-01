import { useState } from 'react';
import { createYookassaPayment } from '../../auth/api';
import { ensureApiSession } from '../../auth/session';
import { useAuthStore } from '../../auth/store';
import type { PlanTier } from '../types';

const PENDING_PAYMENT_KEY = 'tn-pending-payment';

export function useYookassaPay() {
  const { user, openAuthModal, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPayment = async (plan: Extract<PlanTier, 'safe' | 'premium'>) => {
    setError(null);
    setLoading(true);
    try {
      const activeUser = await ensureApiSession();
      if (!activeUser) {
        setError('Войдите по email, чтобы оплатить тариф.');
        openAuthModal('/app/profile');
        setLoading(false);
        return;
      }
      setUser(activeUser);

      const result = await createYookassaPayment(plan);
      const pending = JSON.stringify({ paymentId: result.paymentId, plan: result.plan });
      sessionStorage.setItem(PENDING_PAYMENT_KEY, pending);
      try {
        localStorage.setItem(PENDING_PAYMENT_KEY, pending);
      } catch {
        /* ignore */
      }
      window.location.href = result.confirmationUrl;
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 401) {
        setError('Сессия истекла. Войдите снова.');
        openAuthModal('/app/profile');
      } else {
        setError(err instanceof Error ? err.message : 'Не удалось начать оплату');
      }
      setLoading(false);
    }
  };

  return { startPayment, loading, error };
};
