import React from 'react';
import { DEAL_TYPES } from './constants';
import { CARD_CLASS, FadeIn, SectionHeading } from './shared';

export const DealTypesSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-24">
    <FadeIn>
      <SectionHeading
        title="Для каких сделок подходит"
        subtitle="Сценарий определяется автоматически по вашим ответам"
      />
    </FadeIn>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {DEAL_TYPES.map(({ icon: Icon, title }, i) => (
        <FadeIn key={title} delay={i * 40}>
          <div className={`group h-full ${CARD_CLASS} text-center`}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent-soft flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/10 transition-colors">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <p className="text-desc sm:text-base font-medium text-graphite leading-relaxed">{title}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  </section>
);
