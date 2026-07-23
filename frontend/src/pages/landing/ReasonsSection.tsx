import { Check } from 'lucide-react';
import React from 'react';
import { REASONS } from './constants';
import { CARD_CLASS, FadeIn, SectionHeading } from './shared';

export const ReasonsSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-24">
    <FadeIn>
      <SectionHeading title="Почему люди используют сервис" />
    </FadeIn>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
      {REASONS.map((reason, i) => (
        <FadeIn key={reason} delay={i * 60}>
          <div className={`flex items-start gap-4 ${CARD_CLASS}`}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
              <Check className="h-4 w-4 text-accent" strokeWidth={2.5} />
            </span>
            <p className="text-base font-medium text-graphite leading-relaxed pt-0.5">{reason}</p>
          </div>
        </FadeIn>
      ))}
      <FadeIn delay={300} className="sm:col-span-2">
        <div className="rounded-card bg-accent-soft/40 p-6 text-center shadow-soft">
          <p className="text-base font-medium text-graphite leading-relaxed">
            Это не статья — это живой навигатор, который ведёт вас шаг за шагом
          </p>
        </div>
      </FadeIn>
    </div>
  </section>
);
