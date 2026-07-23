import React from 'react';
import { BENEFITS } from './constants';
import { CARD_CLASS, FadeIn, PrimaryCta, SectionHeading } from './shared';

type BenefitsSectionProps = {
  onStart: () => void;
};

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onStart }) => (
  <section className="py-16 sm:py-20 lg:py-24">
    <FadeIn>
      <SectionHeading title="Что вы получите" />
    </FadeIn>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {BENEFITS.map(({ icon: Icon, title }, i) => (
        <FadeIn key={title} delay={i * 60}>
          <div className={`group h-full ${CARD_CLASS}`}>
            <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center mb-5 group-hover:bg-accent/10 transition-colors">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <p className="text-body font-medium text-graphite leading-relaxed text-safe">{title}</p>
          </div>
        </FadeIn>
      ))}
    </div>
    <FadeIn className="flex justify-center mt-10 sm:mt-12" delay={200}>
      <PrimaryCta onClick={onStart}>Создать план сделки</PrimaryCta>
    </FadeIn>
  </section>
);
