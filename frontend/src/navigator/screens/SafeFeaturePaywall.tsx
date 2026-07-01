import { AnimatePresence, motion } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import { useYookassaPay } from '../hooks/useYookassaPay';

interface SafeFeaturePaywallProps {
  open: boolean;
  onClose: () => void;
}

export const SafeFeaturePaywall: React.FC<SafeFeaturePaywallProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { startPayment, loading, error } = useYookassaPay();

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
            <div className="bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-card max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-graphite-muted" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-accent" />
              </div>

              <h2 className="text-xl font-semibold text-graphite pr-8">
                Получите полный контроль над сделкой
              </h2>
              <p className="text-sm text-graphite-muted mt-3 leading-relaxed">
                Откройте календарь сделки, экстренные сценарии и подробные инструкции в тарифе Safe.
              </p>

              <div className="mt-6 space-y-2">
                <PrimaryButton disabled={loading} onClick={() => void startPayment('safe')}>
                  {loading ? 'Переход к оплате…' : 'Оформить Safe'}
                </PrimaryButton>
                {error && <p className="text-xs text-risk text-center">{error}</p>}
                <SecondaryButton onClick={() => navigate('/app/subscription/safe')}>
                  Подробнее о тарифе
                </SecondaryButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
