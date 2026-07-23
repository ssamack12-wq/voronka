import { motion } from 'framer-motion';
import React from 'react';
import { PhoneMockup } from './PhoneMockup';
import { PrimaryCta, SecondaryCta } from './shared';
import { STATS } from './constants';

type HeroSectionProps = {
  onStart: () => void;
  onPreview: () => void;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onPreview }) => (
  <section className="pb-12 sm:pb-16 lg:pb-20 pt-4 sm:pt-8">
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center">
      <div className="flex flex-col gap-6 sm:gap-7 text-center lg:text-left order-1">
        <p className="badge-eyebrow self-center lg:self-start">Навигатор сделки</p>
        <h1 className="text-hero text-graphite">
          Проведите сделку с&nbsp;недвижимостью безопасно
        </h1>
        <p className="text-subtitle-lg max-w-xl mx-auto lg:mx-0">
          Пошаговый план сделки, проверка рисков и документы — всё в одном месте.
        </p>
        <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 pt-2">
          <PrimaryCta onClick={onStart}>Создать план сделки</PrimaryCta>
          <SecondaryCta onClick={onPreview}>Посмотреть пример</SecondaryCta>
        </div>
        <p className="text-desc text-graphite-muted">Без регистрации · Бесплатно</p>
      </div>

      <div className="flex justify-center lg:justify-end order-2 lg:order-none">
        <PhoneMockup />
      </div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 sm:mt-16 lg:mt-20">
      {STATS.map(({ value, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 + i * 0.08 }}
          className="card-premium text-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
        >
          <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-accent tracking-tight">
            {value}
          </p>
          <p className="text-desc text-graphite-muted mt-2 leading-relaxed">{label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);
