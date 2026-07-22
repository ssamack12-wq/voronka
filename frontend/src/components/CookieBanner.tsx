import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../auth/store';

const CONSENT_KEY = 'tn-cookie-consent';

export const CookieBanner: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    setAccepted(localStorage.getItem(CONSENT_KEY) === '1');
  }, []);

  if (isLoading || user || accepted) return null;

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, '1');
    setAccepted(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
      <div className="max-w-lg mx-auto bg-graphite text-white rounded-2xl px-4 py-3 shadow-card flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="flex-1 text-xs sm:text-sm text-white/90 leading-relaxed">
          Мы используем файлы cookie и сервис Яндекс.Метрика для сбора технических данных и
          улучшения работы сайта.
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-graphite text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          Хорошо
        </button>
      </div>
    </div>
  );
};
