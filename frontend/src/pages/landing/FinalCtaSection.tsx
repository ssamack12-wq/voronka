import React from 'react';
import { FadeIn, PrimaryCta } from './shared';

type FinalCtaSectionProps = {
  onStart: () => void;
};

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onStart }) => (
  <section className="py-16 sm:py-20 lg:py-24">
    <FadeIn>
      <div className="rounded-card bg-white p-8 sm:p-12 lg:p-14 text-center shadow-soft">
        <h2 className="text-section-title text-graphite">Не знаете, с чего начать?</h2>
        <p className="text-subtitle-lg mt-4 max-w-md mx-auto">
          Получите персональный план сделки бесплатно.
        </p>
        <div className="flex justify-center mt-8">
          <PrimaryCta onClick={onStart}>Создать план сделки</PrimaryCta>
        </div>
      </div>
    </FadeIn>
  </section>
);
