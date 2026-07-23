import { ArrowDown, ChevronRight } from 'lucide-react';
import React from 'react';
import { STEPS } from './constants';
import { FadeIn, SectionHeading } from './shared';

export const HowItWorksSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-24 border-t border-gray-100">
    <FadeIn>
      <SectionHeading title="Как это работает" />
    </FadeIn>

    <div className="max-w-5xl mx-auto">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-start justify-between gap-2">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <FadeIn delay={i * 80} className="flex-1 min-w-0">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-white text-lg font-semibold mb-4 shadow-soft">
                  {step.num}
                </div>
                <p className="text-sm lg:text-base font-semibold text-graphite leading-snug px-1">
                  {step.title}
                </p>
              </div>
            </FadeIn>
            {i < STEPS.length - 1 && (
              <div className="flex items-center pt-5 shrink-0 px-1">
                <ChevronRight className="w-6 h-6 text-accent/30" strokeWidth={1.5} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="flex md:hidden flex-col items-center">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <FadeIn delay={i * 80} className="w-full max-w-xs">
              <div className="flex flex-col items-center text-center rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-accent text-white text-base font-semibold mb-3 shadow-soft">
                  {step.num}
                </div>
                <p className="text-sm font-semibold text-graphite leading-snug">{step.title}</p>
              </div>
            </FadeIn>
            {i < STEPS.length - 1 && (
              <div className="py-3">
                <ArrowDown className="w-5 h-5 text-accent/40" strokeWidth={2} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);
