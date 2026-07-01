import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { submitConsultation } from '../../auth/api';
import { useAuthStore } from '../../auth/store';
import { isApiConfigured } from '../../config/api';
import { PrimaryButton } from './ui';
import { useNavigator } from '../store/NavigatorContext';

const NEED_TYPES = [
  'Проверка квартиры',
  'Подготовка документов',
  'Полное сопровождение',
  'Проверка рисков',
  'Помощь с ипотекой'
] as const;

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({ open, onClose }) => {
  const { deal, progress, selectedStepId } = useNavigator();
  const { user } = useAuthStore();
  const [needType, setNeedType] = useState<string>(NEED_TYPES[0]);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && user?.email) setEmail(user.email);
  }, [open, user?.email]);

  const reset = () => {
    setSent(false);
    setError(null);
    setFieldErrors({});
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(reset, 300);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!message.trim()) errs.message = 'Опишите ситуацию';
    if (!phone.trim()) errs.phone = 'Укажите телефон';
    else if (!isValidPhone(phone)) errs.phone = 'Некорректный номер телефона';
    if (!email.trim()) errs.email = 'Укажите email';
    else if (!isValidEmail(email)) errs.email = 'Некорректный email';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await submitConsultation({
        dealId: progress?.id,
        scenarioId: progress?.scenarioId,
        stepId: selectedStepId ?? undefined,
        needType,
        message: message.trim(),
        phone: phone.trim(),
        email: email.trim()
      });
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось отправить заявку';
      setError(
        !isApiConfigured()
          ? 'API не настроен. Задайте VITE_API_URL на фронте (URL бэкенда).'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    message.trim().length > 0 &&
    phone.trim().length > 0 &&
    email.trim().length > 0 &&
    !loading &&
    !sent;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[70] max-w-lg mx-auto bg-white rounded-3xl shadow-card max-h-[min(90vh,640px)] flex flex-col overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-h-[85vh]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <h2 id="lead-modal-title" className="text-lg font-semibold text-graphite">
                {sent ? 'Заявка отправлена' : 'Получить помощь специалиста'}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {sent ? (
                <motion.div
                  className="flex flex-col items-center text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <p className="text-graphite font-medium mb-2">Специалист свяжется с вами в ближайшее время.</p>
                  <p className="text-sm text-graphite-muted">
                    Мы сохранили вашу заявку по сценарию «{deal?.scenario.title ?? 'сделка'}».
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-6 text-sm font-semibold text-accent"
                  >
                    Закрыть
                  </button>
                </motion.div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {deal && (
                    <p className="text-xs text-graphite-muted">
                      Сценарий: {deal.scenario.title}
                      {selectedStepId
                        ? ` · шаг ${deal.steps.findIndex((s) => s.id === selectedStepId) + 1}`
                        : ''}
                    </p>
                  )}

                  <div>
                    <p className="text-sm font-medium text-graphite mb-2">Что вам нужно?</p>
                    <div className="flex flex-wrap gap-2">
                      {NEED_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNeedType(t)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                            needType === t
                              ? 'border-accent bg-accent-soft text-accent'
                              : 'border-gray-200 text-graphite-muted hover:border-gray-300'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      placeholder="Опишите ситуацию"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none ${
                        fieldErrors.message ? 'border-risk' : 'border-gray-200'
                      }`}
                    />
                    {fieldErrors.message && (
                      <p className="text-xs text-risk mt-1">{fieldErrors.message}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Ваш телефон"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                        fieldErrors.phone ? 'border-risk' : 'border-gray-200'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-risk mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Ваш email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                        fieldErrors.email ? 'border-risk' : 'border-gray-200'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-risk mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                      <p className="text-sm text-risk">{error}</p>
                      <button
                        type="button"
                        className="text-sm font-semibold text-accent mt-2"
                        onClick={() => setError(null)}
                      >
                        Повторить
                      </button>
                    </div>
                  )}

                  <PrimaryButton disabled={!canSubmit} type="submit">
                    {loading ? 'Отправка…' : 'Отправить заявку'}
                  </PrimaryButton>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
