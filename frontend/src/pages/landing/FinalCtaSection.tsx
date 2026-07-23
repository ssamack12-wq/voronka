import React from 'react';
import { FadeIn, PrimaryCta } from './shared';

type FinalCtaSectionProps = {
  onStart: () => void;
};

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onStart }) => (
  <section className="py-16 sm:py-20 lg:py-24 border-t border-gray-100">
    <FadeIn>
      <div className="rounded-3xl border border-accent/15 bg-gradient-to-b from-accent-soft/50 to-white p-8 sm:p-12 lg:p-14 text-center shadow-soft">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-graphite tracking-tight leading-tight">
          Не знаете, с чего начать?
        </h2>
        <p className="text-base sm:text-lg text-graphite-muted mt-3 max-w-md mx-auto">
          Получите персональный план сделки бесплатно.
        </p>
        <div className="flex justify-center mt-8">
          <PrimaryCta onClick={onStart}>Начать</PrimaryCta>
        </div>
      </div>
    </FadeIn>
  </section>
);
