import React from 'react';
import { FadeIn, PrimaryCta } from './shared';

type FinalCtaSectionProps = {
  onStart: () => void;
};

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onStart }) => (
  <section className="py-16 sm:py-20 lg:py-24">
    <FadeIn>
      <div className="card-premium text-center min-w-0">
        <h2 className="text-section-title text-graphite text-safe">Не знаете, с чего начать?</h2>
        <p className="text-subtitle-lg mt-4 max-w-md mx-auto text-safe">
          Получите персональный план сделки бесплатно.
        </p>
        <div className="flex justify-center mt-8">
          <PrimaryCta onClick={onStart}>Создать план сделки</PrimaryCta>
        </div>
      </div>
    </FadeIn>
  </section>
);
