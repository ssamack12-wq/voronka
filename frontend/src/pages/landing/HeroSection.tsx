import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import React from 'react';
import { PhoneMockup } from './PhoneMockup';
import { PrimaryCta } from './shared';
import { STATS } from './constants';

type HeroSectionProps = {
  onStart: () => void;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => (
  <section className="pb-12 sm:pb-16 lg:pb-20">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-16 items-center">
      <div className="flex flex-col gap-5 sm:gap-6 text-center lg:text-left order-1">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider">
          Навигатор сделки
        </p>
        <h1 className="text-[1.75rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-semibold text-graphite tracking-tight leading-[1.12]">
          Проведите сделку с&nbsp;недвижимостью без&nbsp;ошибок
        </h1>
        <p className="text-base sm:text-lg text-graphite-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
          Получите персональный маршрут сделки. Навигатор учитывает ипотеку, маткапитал,
          альтернативную сделку, детей, нескольких собственников и другие особенности.
        </p>
        <p className="text-sm font-medium text-graphite">
          Без регистрации · Бесплатно
        </p>
        <div className="flex flex-col items-center lg:items-start gap-2 pt-1">
          <PrimaryCta onClick={onStart} />
          <p className="text-xs text-graphite-muted">Это займёт всего 30 секунд</p>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end order-2 lg:order-none">
        <PhoneMockup />
      </div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-14 lg:mt-16">
      {STATS.map(({ value, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 + i * 0.08 }}
          className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-soft text-center hover:shadow-card hover:border-accent/20 hover:-translate-y-0.5 transition-all"
        >
          <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-accent tracking-tight">
            {value}
          </p>
          <p className="text-xs sm:text-sm text-graphite-muted mt-1.5 leading-snug">{label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);
