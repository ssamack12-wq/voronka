import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STANDARD_CTA } from '../constants';

export const ConversionBlock: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="my-8 p-5 sm:p-6 rounded-2xl bg-accent-soft/60 border border-accent/15 shadow-soft">
      <h3 className="text-base sm:text-lg font-semibold text-graphite mb-2">{STANDARD_CTA.ctaTitle}</h3>
      <p className="text-sm text-graphite-muted leading-relaxed mb-4">{STANDARD_CTA.ctaText}</p>
      <button
        type="button"
        onClick={() => navigate('/app/onboarding')}
        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-accent text-white text-sm font-semibold active:scale-[0.98] transition-transform shadow-soft"
      >
        {STANDARD_CTA.ctaButton}
      </button>
    </aside>
  );
};
