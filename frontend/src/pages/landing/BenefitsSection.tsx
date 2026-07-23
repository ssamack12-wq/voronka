import React from 'react';
import { BENEFITS } from './constants';
import { FadeIn, PrimaryCta, SectionHeading } from './shared';

type BenefitsSectionProps = {
  onStart: () => void;
};

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onStart }) => (
  <section className="py-16 sm:py-20 lg:py-24 border-t border-gray-100">
    <FadeIn>
      <SectionHeading title="Что вы получите" />
    </FadeIn>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {BENEFITS.map(({ icon: Icon, title }, i) => (
        <FadeIn key={title} delay={i * 60}>
          <div className="group h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-soft hover:shadow-card hover:border-accent/25 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <p className="text-base font-semibold text-graphite">{title}</p>
          </div>
        </FadeIn>
      ))}
    </div>
    <FadeIn className="flex justify-center mt-10 sm:mt-12" delay={200}>
      <PrimaryCta onClick={onStart}>Начать</PrimaryCta>
    </FadeIn>
  </section>
);
