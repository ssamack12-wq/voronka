import { BookOpen, Clock, Flag, HelpCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store';
import { canCompleteStep, checklistProgress, subtaskProgress } from '../engine/buildDeal';
import { getTutorial } from '../data/tutorials';
import {
  canAccessEmergencyScenarios,
  resolveEffectivePlan
} from '../engine/planAccess';
import { canGuestMarkSteps, canGuestUseEmergency } from '../engine/guestAccess';
import { riskColorClasses, riskLabel } from '../engine/riskScoring';
import { EmergencyScenariosPanel } from '../components/EmergencyScenariosPanel';
import { OppositePartyCard } from '../components/OppositePartyCard';
import { Header } from '../components/Header';
import {
  Card,
  CheckIcon,
  FeatureRow,
  GhostButton,
  ListRow,
  PageShell,
  PrimaryButton,
  SectionTitle
} from '../components/ui';
import { readStepScroll, saveStepScroll } from '../hooks/navigationPersistence';
import { useScrollRestore } from '../hooks/useScrollRestore';
import { useNavigator } from '../store/NavigatorContext';
import { SafeFeaturePaywall } from './SafeFeaturePaywall';

export const StepDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [safePaywallOpen, setSafePaywallOpen] = useState(false);
  const {
    deal,
    progress,
    selectedStepId,
    selectedTutorialId,
    toggleChecklistItem,
    completeStep,
    openLeadModal,
    setSelectedTutorialId,
    clearTutorial,
    isFavorite,
    toggleFavorite
  } = useNavigator();

  const readStepScrollForId = useCallback(
    () => (selectedStepId ? readStepScroll(selectedStepId) : undefined),
    [selectedStepId]
  );
  const saveStepScrollForId = useCallback(
    (scrollY: number) => {
      if (selectedStepId) saveStepScroll(selectedStepId, scrollY);
    },
    [selectedStepId]
  );
  const scrollRef = useScrollRestore(saveStepScrollForId, readStepScrollForId, 'returnScrollY');

  if (!deal || !progress || !selectedStepId) return null;

  const step = deal.steps.find((s) => s.id === selectedStepId);
  if (!step) return null;

  const stepProgress = progress.steps[step.id];
  const stepIndex = deal.steps.findIndex((s) => s.id === step.id) + 1;
  const canComplete = canCompleteStep(progress, step.id);
  const isCompleted = stepProgress?.status === 'completed';
  const checklistPct = checklistProgress(progress, step.id);
  const riskC = riskColorClasses(step.riskLevel);
  const primaryTutorialId = step.tutorialIds[0];
  const tutorial = primaryTutorialId ? getTutorial(primaryTutorialId, progress.scenarioId) : null;
  const tutorialSubtaskPct =
    tutorial?.subtasks?.length && progress
      ? subtaskProgress(progress, step.id, tutorial.subtasks.map((s) => s.id))
      : 0;
  const favoriteId = `step:${step.id}`;
  const returnScrollY = (location.state as { returnScrollY?: number } | null)?.returnScrollY ?? 0;
  const plan = resolveEffectivePlan(user, progress);
  const canEmergency = canAccessEmergencyScenarios(plan);

  const handleEmergencyClick = () => {
    if (!canGuestUseEmergency(user)) {
      void useAuthStore.getState().requestAccess(`/app/deal/step/${step.id}`);
      return;
    }
    if (canEmergency) setEmergencyOpen(true);
    else setSafePaywallOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        subtitle={`Шаг ${stepIndex} из ${deal.steps.length}`}
        title={step.title}
        onBack={() => {
          if (selectedTutorialId) {
            window.history.back();
            return;
          }
          clearTutorial();
          navigate('/app/deal', { state: { restoreScrollY: returnScrollY } });
        }}
        showBookmark
        bookmarked={isFavorite(favoriteId)}
        onBookmark={() => toggleFavorite(favoriteId)}
      />
      <PageShell ref={scrollRef} className="overflow-y-auto pb-8">
        <p className="text-body text-graphite-muted leading-relaxed mb-2 text-safe">
          {step.shortDescription}
        </p>
        <p className="text-body text-graphite leading-relaxed mb-4 text-safe">{step.detailedDescription}</p>

        {checklistPct > 0 && checklistPct < 100 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-graphite-muted mb-1">
              <span>Чек-лист</span>
              <span>{checklistPct}%</span>
            </div>
            <div className="h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${checklistPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5">
          <div className="flex items-center gap-2 text-body text-graphite-muted min-w-0">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="text-safe">Время: {step.estimatedTime}</span>
          </div>
          <div className={`flex items-center gap-2 text-body min-w-0 ${riskC.text}`}>
            <Flag className="w-4 h-4 shrink-0" />
            <span className="text-safe">Риск: {riskLabel(step.riskLevel)}</span>
          </div>
        </div>

        {step.warnings.length > 0 && (
          <Card tone="warning" className="mb-5">
            <ul className="text-desc text-amber-900 space-y-1 text-safe">
              {step.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          </Card>
        )}

        <SectionTitle>Что нужно сделать</SectionTitle>
        <div className="space-y-3">
          {step.checklist.map((item) => {
            const checked = stepProgress?.checklist[item.id] ?? false;
            return (
              <Card key={item.id}>
                <FeatureRow
                  icon={
                    <button
                      type="button"
                      onClick={() => {
                        if (!canGuestMarkSteps(user)) {
                          void useAuthStore.getState().requestAccess(`/app/deal/step/${step.id}`);
                          return;
                        }
                        toggleChecklistItem(step.id, item.id);
                      }}
                      className="shrink-0"
                      aria-label={checked ? 'Отметить невыполненным' : 'Отметить выполненным'}
                    >
                      <CheckIcon checked={checked} />
                    </button>
                  }
                  title={
                    <span className="flex items-start justify-between gap-2 w-full min-w-0">
                      <span
                        className={`text-safe flex-1 min-w-0 ${checked ? 'text-graphite-muted line-through' : ''}`}
                      >
                        {item.title}
                      </span>
                      {item.mandatory && (
                        <span className="text-[10px] font-medium text-risk uppercase shrink-0">
                          Обязательно
                        </span>
                      )}
                    </span>
                  }
                  description={item.description}
                />
              </Card>
            );
          })}
        </div>

        {primaryTutorialId && (
          <button
            type="button"
            onClick={() => setSelectedTutorialId(primaryTutorialId)}
            className="mt-4 card-premium-interactive w-full text-left bg-accent-soft/40 hover:bg-accent-soft/60 !border-0 min-w-0"
          >
            <div className="feature-row__content text-safe">
              <p className="text-body font-medium text-accent flex items-center gap-2 text-safe">
                <BookOpen className="w-4 h-4 shrink-0" />
                Открыть подробную инструкцию
              </p>
              <p className="text-small text-graphite-muted mt-1 text-safe">
              {tutorial?.subtasks?.length
                ? `${tutorial.subtasks.length} подзадач с пошаговыми действиями и ссылками${
                    tutorialSubtaskPct > 0 ? ` · ${tutorialSubtaskPct}%` : ''
                  }`
                : 'Пошаговая инструкция с ответами и ссылками'}
              </p>
            </div>
          </button>
        )}

        <OppositePartyCard
          stepId={step.id}
          phase={step.phase}
          category={deal.scenario.category}
        />

        <button
          type="button"
          onClick={handleEmergencyClick}
          className="mt-4 card-premium-interactive w-full text-left min-w-0"
        >
          <div className="feature-row__content text-safe">
            <p className="text-body font-medium text-graphite flex items-center gap-2 text-safe">
              <HelpCircle className="w-4 h-4 text-accent shrink-0" />
              Что делать если…
            </p>
            <p className="text-small text-graphite-muted mt-1 text-safe">
              Экстренные сценарии и пошаговые действия
            </p>
          </div>
        </button>

        <div className="mt-6 space-y-3">
          <GhostButton onClick={openLeadModal}>Нужна помощь специалиста?</GhostButton>
          <PrimaryButton
            disabled={!canComplete}
            onClick={() => {
              if (!canGuestMarkSteps(user)) {
                void useAuthStore.getState().requestAccess(`/app/deal/step/${step.id}`);
                return;
              }
              completeStep(step.id);
            }}
          >
            {isCompleted ? 'Шаг выполнен' : 'Отметить шаг выполненным'}
          </PrimaryButton>
        </div>
      </PageShell>

      <EmergencyScenariosPanel open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <SafeFeaturePaywall open={safePaywallOpen} onClose={() => setSafePaywallOpen(false)} />
    </div>
  );
};
