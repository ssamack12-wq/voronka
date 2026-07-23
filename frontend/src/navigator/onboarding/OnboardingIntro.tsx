import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginButton } from '../../components/LoginButton';
import { Header } from '../components/Header';
import { ChecklistRow, PageShell, PrimaryButton, SecondaryButton } from '../components/ui';

const FEATURES = [
  {
    title: 'Персональный roadmap',
    desc: 'План под вашу сделку — покупка, продажа, ипотека, маткапитал'
  },
  {
    title: 'Проверка рисков',
    desc: 'Учёт опеки, доверенностей, обременений и других факторов'
  },
  {
    title: 'Чеклисты и документы',
    desc: 'Пошаговые инструкции и контроль прогресса на каждом этапе'
  }
];

export const OnboardingIntro: React.FC = () => {
  const navigate = useNavigate();

  const handlePreview = () => {
    window.location.href = '/#app-preview';
  };

  return (
    <PageShell className="flex-1 justify-between pb-6 bg-surface" noPadding>
      <Header
        logo
        title="Навигатор сделки"
        rightSlot={<LoginButton redirectPath="/app/onboarding" />}
      />
      <div className="page-content flex flex-col flex-1 justify-center gap-10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <p className="badge-eyebrow mb-5">Навигатор сделки</p>
          <h1 className="text-hero text-graphite max-w-md mx-auto text-safe">
            Проведите сделку с&nbsp;недвижимостью безопасно
          </h1>
          <p className="text-subtitle-lg mt-5 max-w-sm mx-auto text-safe">
            Пошаговый план сделки, проверка рисков и документы — всё в одном месте.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-3"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
            >
              <ChecklistRow title={feature.title} description={feature.desc} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="space-y-3"
        >
          <PrimaryButton onClick={() => navigate('/app/onboarding/quiz')}>
            Создать план сделки
          </PrimaryButton>
          <SecondaryButton onClick={handlePreview}>Посмотреть пример</SecondaryButton>
          <p className="text-desc text-graphite-muted text-center pt-1">Без регистрации · Бесплатно</p>
        </motion.div>
      </div>
    </PageShell>
  );
};
