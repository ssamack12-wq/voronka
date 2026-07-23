import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import React from 'react';

const CHECKLIST = [
  'Проверить продавца',
  'Проверить ЕГРН',
  'Проверить банкротство',
  'Проверить документы'
];

export const PhoneMockup: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
    className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[320px]"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
    >
      <div className="absolute -inset-6 sm:-inset-8 rounded-[3.5rem] bg-accent/8 blur-3xl" aria-hidden />
      <div className="relative rounded-[2.5rem] border-[6px] border-gray-900 bg-gray-900 shadow-card overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28%] min-w-[72px] max-w-[100px] h-6 bg-gray-900 rounded-b-2xl z-10" />

        <div className="bg-white pt-9 pb-6 px-4 min-h-[400px] sm:min-h-[440px]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold text-accent uppercase tracking-wider">
              Навигатор сделки
            </p>
            <span className="text-[11px] text-graphite-muted font-medium tabular-nums">
              Шаг 8 из 26
            </span>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-graphite-muted">Прогресс сделки</p>
              <p className="text-xs font-semibold text-accent tabular-nums">31%</p>
            </div>
            <div className="h-2 rounded-full bg-black/[0.04] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '31%' }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full bg-accent"
              />
            </div>
          </div>

          <p className="text-sm font-semibold text-graphite mb-3">Проверка продавца</p>

          <ul className="space-y-2">
            {CHECKLIST.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-2.5 rounded-btn shadow-soft bg-surface px-3 py-2.5"
              >
                <span className="check-icon check-icon--done !w-5 !h-5">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-desc text-graphite">{item}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="mt-4 banner-warning !text-[11px] !py-2.5"
          >
            <p className="font-medium leading-snug">
              ⚠ Риск: проверьте доверенность, если продавец не присутствует
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);
