import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Check, FileText, Shield, Sparkles } from 'lucide-react';
import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackEvent } from '../../hooks/useAnalytics';
import { resolveScenario } from '../engine/resolveScenario';
import { getDealPreviewStats } from '../engine/guestAccess';
import { countUnknownAnswers, quizRiskLevelLabel } from '../engine/quizRiskScore';
import { Header } from '../components/Header';
import {
  Card,
  CardContent,
  FeatureRow,
  PageShell,
  PrimaryButton,
  RiskBadge,
  SecondaryButton,
  SectionTitle,
  StatFeatureRow,
  TextButton
} from '../components/ui';
import type { PlanTier, QuizAnswers } from '../types';
import { useAuthStore } from '../../auth/store';
import { useNavigator } from '../store/NavigatorContext';
import { savePendingQuiz } from './pendingQuiz';

export const QuizResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, requestAccess, openAuthModal } = useAuthStore();
  const { startFromQuiz } = useNavigator();

  const answers = (location.state as { answers?: QuizAnswers } | null)?.answers;
  const resolved = useMemo(() => (answers ? resolveScenario(answers) : null), [answers]);
  const preview = useMemo(() => (answers ? getDealPreviewStats(answers) : null), [answers]);
  const unknownCount = answers ? countUnknownAnswers(answers) : 0;

  if (!answers || !resolved || !preview) {
    return (
      <PageShell>
        <p className="text-sm text-graphite-muted">Сначала пройдите квиз.</p>
        <PrimaryButton className="mt-4" onClick={() => navigate('/app/onboarding/quiz')}>
          К квизу
        </PrimaryButton>
      </PageShell>
    );
  }

  const openRoadmap = (plan: PlanTier = 'base') => {
    trackEvent('opened_roadmap', { scenarioId: resolved.scenarioId, plan, guest: !user });
    savePendingQuiz({ answers, plan });
    startFromQuiz(answers, plan);
    navigate('/app/deal');
  };

  const loginAndSave = async () => {
    savePendingQuiz({ answers, plan: 'base' });
    const authed = await requestAccess('/app/deal');
    if (authed) {
      startFromQuiz(answers, 'base');
      navigate('/app/deal');
    }
  };

  return (
    <PageShell className="pb-6 overflow-y-auto" noPadding>
      <Header onBack={() => navigate('/app/onboarding/quiz')} title="Результат" />
      <div className="page-content space-y-5 pb-4 min-w-0 max-w-full">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
          <p className="badge-eyebrow mb-2">Сценарий определён</p>
          <h2 className="text-h2 text-graphite text-safe leading-tight">{preview.displayTitle}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-sm text-graphite-muted text-safe">
              Сложность: <strong className="text-graphite">{resolved.complexity}/10</strong>
            </span>
            <RiskBadge level={resolved.quizRiskLevel === 'high' ? 'high' : resolved.quizRiskLevel === 'medium' ? 'medium' : 'low'} compact />
            <span className="text-xs text-graphite-muted text-safe">
              Риск: {quizRiskLevelLabel(resolved.quizRiskLevel)}
            </span>
          </div>
        </motion.div>

        {unknownCount > 0 && (
          <Card tone="accent">
            <p className="text-body font-medium text-graphite text-safe leading-snug">
              Несколько параметров сделки не определены.
            </p>
            <p className="text-small text-graphite-muted mt-2 text-safe leading-relaxed">
              Мы подготовили расширенный сценарий сделки, чтобы вы не пропустили важные проверки.
            </p>
          </Card>
        )}

        {unknownCount >= 2 && (
          <Card>
            <FeatureRow
              icon={<Shield className="w-6 h-6 text-accent" />}
              title="Рекомендуем использовать тариф Safe"
              description="В нём доступны дополнительные проверки и рекомендации по рискам."
            />
            <SecondaryButton
              className="mt-3 !py-2.5 text-sm"
              onClick={() => {
                if (user) navigate('/app/subscription/safe');
                else openAuthModal('/app/subscription/safe');
              }}
            >
              {user ? 'Тариф «Безопасный»' : 'Войти и выбрать тариф'}
            </SecondaryButton>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-accent-soft/70 to-white">
          <p className="text-body font-medium text-graphite mb-3 text-safe">В вашем плане:</p>
          <ul className="card-list">
            <StatFeatureRow icon={<Check className="w-4 h-4 text-accent" />} text={`${preview.stepsCount} этапов`} />
            <StatFeatureRow icon={<Shield className="w-4 h-4 text-accent" />} text={`${preview.checksCount} проверок`} />
            <StatFeatureRow icon={<FileText className="w-4 h-4 text-accent" />} text={`${preview.documentsCount} документов`} />
            <StatFeatureRow icon={<Calendar className="w-4 h-4 text-graphite-muted" />} text="календарь сделки" locked={!user} />
            <StatFeatureRow icon={<Sparkles className="w-4 h-4 text-graphite-muted" />} text="экстренные сценарии" locked={!user} />
            <StatFeatureRow icon={<Check className="w-4 h-4 text-accent" />} text="инструкции по каждому шагу" />
          </ul>
          {!user && (
            <p className="text-small text-graphite-muted mt-4 text-safe leading-relaxed">
              Календарь, сохранение прогресса и полный список документов — после входа. Просмотр
              сценария доступен без регистрации.
            </p>
          )}
        </Card>

        {resolved.detectedRisks.length > 0 && (
          <Card>
            <SectionTitle>Обнаружены риски</SectionTitle>
            <ul className="card-list mt-3">
              {resolved.detectedRisks.map((r) => (
                <li key={r} className="list-row list-row--nested">
                  <span className="list-row__icon text-risk">•</span>
                  <span className="list-row__content text-body text-graphite text-safe">{r}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {resolved.warnings.map((w) => (
          <Card key={w.id} tone="warning">
            <FeatureRow
              icon={<AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />}
              title={<span className="font-medium text-amber-900">{w.title}</span>}
              description={<span className="text-amber-800">{w.body}</span>}
            />
          </Card>
        ))}

        <div className="space-y-3">
          {user ? (
            <PrimaryButton onClick={() => openRoadmap('base')}>
              Открыть план сделки
            </PrimaryButton>
          ) : (
            <>
              <PrimaryButton onClick={() => openRoadmap('base')}>
                Продолжить без входа
              </PrimaryButton>
              <SecondaryButton onClick={() => void loginAndSave()}>
                Войти и сохранить прогресс
              </SecondaryButton>
            </>
          )}
        </div>

        {resolved.quizRiskLevel === 'high' && unknownCount < 2 && (
          <Card>
            <FeatureRow
              icon={<Shield className="w-6 h-6 text-accent" />}
              title="Рекомендуем тариф «Безопасный»"
              description="Полные инструкции, разбор рисков и предупреждения — после оплаты в профиле."
            />
            <SecondaryButton
              className="mt-3 !py-2.5 text-sm"
              onClick={() => {
                if (user) navigate('/app/subscription/safe');
                else openAuthModal('/app/subscription/safe');
              }}
            >
              {user ? 'Тариф «Безопасный»' : 'Войти и выбрать тариф'}
            </SecondaryButton>
          </Card>
        )}

        <TextButton onClick={() => navigate('/app/onboarding/quiz')}>
          Изменить ответы
        </TextButton>
      </div>
    </PageShell>
  );
};
