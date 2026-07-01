import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginButton } from '../../components/LoginButton';
import { Header } from '../components/Header';
import { PageShell, PrimaryButton, SectionTitle } from '../components/ui';

export const OnboardingIntro: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageShell className="flex-1 justify-between pb-6" noPadding>
      <Header
        logo
        title="Навигатор сделки"
        rightSlot={<LoginButton redirectPath="/app/onboarding" />}
      />
      <div className="px-4 flex flex-col flex-1 justify-center gap-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
            Проверим вашу сделку
          </p>
          <h1 className="text-2xl sm:text-[1.65rem] font-semibold text-graphite tracking-tight leading-tight">
            Ответьте на несколько вопросов
          </h1>
          <p className="text-sm text-graphite-muted mt-4 leading-relaxed max-w-sm mx-auto">
            Мы определим сценарий сделки и построим безопасный план действий — шаг за шагом.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <SectionTitle sub="Без ручного выбора сценария — только ваши ответы">
            Спокойный путь к сделке
          </SectionTitle>
          <ul className="text-sm text-graphite space-y-2 mt-3">
            <li className="flex gap-2">
              <span className="text-accent font-bold">1</span>
              <span>Персональный roadmap под вашу сделку</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">2</span>
              <span>Учёт рисков: ипотека, маткапитал, опека</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">3</span>
              <span>Чеклисты и контроль прогресса</span>
            </li>
          </ul>
        </motion.div>

        <PrimaryButton onClick={() => navigate('/app/onboarding/quiz')}>Начать</PrimaryButton>
      </div>
    </PageShell>
  );
};
