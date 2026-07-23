import React from 'react';
import { AppPreview } from './AppPreview';
import { FadeIn, SectionHeading } from './shared';

export const WhatsInsideSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-24 border-t border-gray-100 overflow-hidden">
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
