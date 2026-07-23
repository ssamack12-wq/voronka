import React from 'react';
import { DEAL_TYPES } from './constants';
import { FadeIn, SectionHeading } from './shared';

export const DealTypesSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-24 border-t border-gray-100">
    <FadeIn>
      <SectionHeading
        title="Для каких сделок подходит"
        subtitle="Сценарий определяется автоматически по вашим ответам"
      />
    </FadeIn>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {DEAL_TYPES.map(({ icon: Icon, title }, i) => (
        <FadeIn key={title} delay={i * 40}>
          <div className="group h-full rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-soft hover:shadow-card hover:border-accent/25 hover:-translate-y-0.5 transition-all duration-300 text-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent-soft flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/10 transition-colors">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-graphite leading-snug">{title}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  </section>
);
