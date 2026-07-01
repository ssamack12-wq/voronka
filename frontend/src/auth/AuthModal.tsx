import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, Mail, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { OpenEmailApps } from '../components/OpenEmailApps';
import {
  DOMAIN_RESTRICTION_ERROR,
  EMAIL_INFO_HINT,
  isAllowedEmailDomain,
  isValidEmailFormat
} from './allowedDomains';
import { useAuthStore } from './store';

const OTP_LENGTH = 4;
const TERMS_OF_SERVICE_URL = '/terms-of-service.pdf';

interface AuthModalProps {
  open: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open }) => {
  const {
    loginPending,
    pendingEmail,
    devCode,
    devLink,
    error,
    requestLogin,
    verifyCode,
    closeAuthModal,
    resetLoginFlow,
    user
  } = useAuthStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  const trimmedEmail = email.trim();
  const emailFormatValid = isValidEmailFormat(trimmedEmail);
  const emailDomainAllowed = emailFormatValid && isAllowedEmailDomain(trimmedEmail);
  const canSubmitEmail = emailFormatValid && emailDomainAllowed && !submitting;

  const handleEmailBlur = () => {
    if (!trimmedEmail) {
      setDomainError(null);
      return;
    }
    if (!emailFormatValid) {
      setDomainError(null);
      return;
    }
    if (!isAllowedEmailDomain(trimmedEmail)) {
      setDomainError(DOMAIN_RESTRICTION_ERROR);
      return;
    }
    setDomainError(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (domainError) setDomainError(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFormatValid) return;
    if (!isAllowedEmailDomain(trimmedEmail)) {
      setDomainError(DOMAIN_RESTRICTION_ERROR);
      return;
    }
    setSubmitting(true);
    await requestLogin(trimmedEmail);
    setSubmitting(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== OTP_LENGTH) return;
    setSubmitting(true);
    await verifyCode(code);
    setSubmitting(false);
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, OTP_LENGTH));
  };

  const infoLines = useMemo(() => EMAIL_INFO_HINT.split('\n'), []);

  if (user) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            aria-hidden
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[70] max-w-lg mx-auto sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 pointer-events-none"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-8 shadow-card relative w-full pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeAuthModal}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-graphite-muted" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
                {loginPending ? (
                  <KeyRound className="w-6 h-6 text-accent" />
                ) : (
                  <Mail className="w-6 h-6 text-accent" />
                )}
              </div>

              {!loginPending ? (
                <>
                  <h2 className="text-xl font-semibold text-graphite">Продолжить сделку</h2>
                  <p className="text-sm text-graphite-muted mt-2 leading-relaxed">
                    Введите email — отправим 4-значный код и ссылку для входа.
                  </p>
                  <form onSubmit={(e) => void handleEmailSubmit(e)} className="mt-5 space-y-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={handleEmailBlur}
                      placeholder="example@yandex.ru"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                      autoComplete="email"
                      disabled={submitting}
                    />
                    <div className="rounded-xl bg-surface border border-gray-100 px-4 py-3 text-xs text-graphite-muted leading-relaxed">
                      {infoLines.map((line) => (
                        <p key={line} className={line.startsWith('•') ? 'pl-1' : undefined}>
                          {line}
                        </p>
                      ))}
                    </div>
                    {(domainError || error) && (
                      <p className="text-sm text-risk whitespace-pre-line">{domainError ?? error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={!canSubmitEmail}
                      className="w-full py-3.5 rounded-2xl bg-accent text-white font-semibold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-60"
                    >
                      {submitting ? 'Отправка…' : 'Продолжить'}
                    </button>
                    <p className="text-xs text-graphite-muted text-center leading-relaxed">
                      Продолжая, вы соглашаетесь с{' '}
                      <a
                        href={TERMS_OF_SERVICE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline font-medium"
                      >
                        Условиями и соглашениями
                      </a>
                    </p>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-graphite">Введите код</h2>
                  <p className="text-sm text-graphite-muted mt-2 leading-relaxed">
                    Мы отправили 4-значный код и ссылку на{' '}
                    <span className="font-medium text-graphite">{pendingEmail}</span>
                  </p>

                  <form onSubmit={(e) => void handleCodeSubmit(e)} className="mt-5 space-y-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      placeholder="0000"
                      maxLength={OTP_LENGTH}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-center text-2xl font-semibold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-accent/30"
                      disabled={submitting}
                    />
                    {error && <p className="text-sm text-risk">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting || code.length !== OTP_LENGTH}
                      className="w-full py-3.5 rounded-2xl bg-accent text-white font-semibold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-60"
                    >
                      {submitting ? 'Проверка…' : 'Войти по коду'}
                    </button>
                  </form>

                  <OpenEmailApps email={pendingEmail} className="mt-4" />

                  <p className="text-xs text-graphite-muted mt-3 leading-relaxed">
                    Или перейдите по ссылке из письма. Код и ссылка действуют 15 минут. Проверьте
                    «Спам».
                  </p>

                  {(devCode || devLink) && (
                    <div className="mt-3 rounded-xl bg-surface border border-gray-100 p-3 text-xs text-graphite-muted space-y-1">
                      <p className="font-semibold text-graphite">Локальная разработка (без Resend)</p>
                      {devCode && (
                        <p>
                          Код: <span className="font-mono font-semibold text-accent">{devCode}</span>
                        </p>
                      )}
                      {devLink && (
                        <p className="break-all">
                          <a href={devLink} className="text-accent underline">
                            Открыть magic link
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="mt-4 text-sm text-accent font-medium"
                    onClick={() => {
                      resetLoginFlow();
                      setCode('');
                      setDomainError(null);
                    }}
                  >
                    ← Другой email
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
