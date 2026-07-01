import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ConversionBlock: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="my-8 p-5 sm:p-6 rounded-2xl bg-accent-soft/60 border border-accent/15 shadow-soft">
      <h3 className="text-base sm:text-lg font-semibold text-graphite mb-2">
        Ваша ситуация может отличаться
      </h3>
      <p className="text-sm text-graphite-muted leading-relaxed mb-4">
        Количество документов, проверок и рисков зависит от типа сделки. Получите персональный план за 2
        минуты.
      </p>
      <button
        type="button"
        onClick={() => navigate('/app/onboarding')}
        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-accent text-white text-sm font-semibold active:scale-[0.98] transition-transform shadow-soft"
      >
        Определить мой сценарий
      </button>
    </aside>
  );
};
