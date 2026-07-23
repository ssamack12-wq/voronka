import React from 'react';
import { AppPreview } from './AppPreview';
import { FadeIn, SectionHeading } from './shared';

export const WhatsInsideSection: React.FC = () => (
  <section id="app-preview" className="py-16 sm:py-20 lg:py-24 overflow-hidden scroll-mt-8">
    <FadeIn>
      <SectionHeading
        eyebrow="Интерфейс"
        title="Что внутри"
        subtitle="Не статья — живой навигатор с чек-листами, рисками и документами"
      />
    </FadeIn>
    <FadeIn delay={100}>
      <AppPreview />
    </FadeIn>
  </section>
);
