import { Check } from 'lucide-react';
import React from 'react';
import { REASONS } from './constants';
import { FadeIn, SectionHeading } from './shared';

export const ReasonsSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-24 border-t border-gray-100">
    <FadeIn>
      <SectionHeading title="Почему люди используют сервис" />
    </FadeIn>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
      {REASONS.map((reason, i) => (
        <FadeIn key={reason} delay={i * 60}>
          <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-soft hover:shadow-card hover:border-accent/20 transition-all">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft">
              <Check className="h-4 w-4 text-accent" strokeWidth={2.5} />
            </span>
            <p className="text-sm sm:text-base font-medium text-graphite leading-snug pt-0.5">
              {reason}
            </p>
          </div>
        </FadeIn>
      ))}
      <FadeIn delay={300} className="sm:col-span-2">
        <div className="rounded-2xl border border-dashed border-accent/25 bg-accent-soft/30 p-5 sm:p-6 text-center">
          <p className="text-sm sm:text-base font-medium text-graphite">
            Это не статья — это живой навигатор, который ведёт вас шаг за шагом
          </p>
        </div>
      </FadeIn>
    </div>
  </section>
);
