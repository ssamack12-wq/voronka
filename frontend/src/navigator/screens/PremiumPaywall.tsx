import { AnimatePresence, motion } from 'framer-motion';
import { Check, Crown, X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTutorial } from '../data/tutorials';
import { SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import { useYookassaPay } from '../hooks/useYookassaPay';

interface PremiumPaywallProps {
  open: boolean;
  tutorialId: string | null;
  onClose: () => void;
}

export const PremiumPaywall: React.FC<PremiumPaywallProps> = ({ open, tutorialId, onClose }) => {
  const navigate = useNavigate();
  const { startPayment, loading, error } = useYookassaPay();
  const tutorial = tutorialId ? getTutorial(tutorialId) : null;
  const planInfo = SUBSCRIPTION_PLANS.premium;

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
            <div className="modal-sheet-bottom max-h-[90vh] overflow-y-auto overflow-x-hidden relative min-w-0 max-w-full">
              <button type="button" onClick={onClose} className="close-btn absolute top-4 right-4" aria-label="Закрыть">
                <X className="w-5 h-5" />
              </button>

              <div className="icon-box icon-box--lg mb-4">
                <Crown className="w-7 h-7 text-accent" />
              </div>

              <h2 className="text-xl font-semibold text-graphite pr-8">
                Подробная инструкция — в тарифе «Премиум»
              </h2>
              {tutorial && (
                <p className="text-sm text-graphite-muted mt-2">{tutorial.title}</p>
              )}
              <p className="text-sm text-graphite-muted mt-3 leading-relaxed">
                Тариф «Премиум» включает пошаговые действия, официальные ссылки, образцы документов и
                разбор типичных ошибок.
              </p>

              <ul className="mt-5 space-y-2.5">
                {planInfo.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-graphite">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                <PrimaryButton disabled={loading} onClick={() => void startPayment('premium')}>
                  {loading
                    ? 'Переход к оплате…'
                    : `Оплатить «Премиум» — ${planInfo.priceLabel}`}
                </PrimaryButton>
                {error && <p className="text-xs text-risk text-center">{error}</p>}
                <SecondaryButton onClick={() => navigate('/app/subscription/premium')}>
                  Подробнее о тарифе
                </SecondaryButton>
                <SecondaryButton onClick={() => navigate('/app/lead')}>
                  Нужна помощь специалиста
                </SecondaryButton>
                <p className="text-center text-[11px] text-graphite-muted pt-1">
                  Подписка на 30 дней. Оплата через ЮKassa.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
