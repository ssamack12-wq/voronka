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
import { Card, GhostButton, PageShell, PrimaryButton, SectionTitle } from '../components/ui';
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
        <p className="text-sm text-graphite-muted leading-relaxed mb-2">
          {step.shortDescription}
        </p>
        <p className="text-sm text-graphite leading-relaxed mb-4">{step.detailedDescription}</p>

        {checklistPct > 0 && checklistPct < 100 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-graphite-muted mb-1">
              <span>Чек-лист</span>
              <span>{checklistPct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${checklistPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-5">
          <div className="flex items-center gap-2 text-sm text-graphite-muted">
            <Clock className="w-4 h-4" />
            <span>Время: {step.estimatedTime}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${riskC.text}`}>
            <Flag className="w-4 h-4" />
            <span>Риск: {riskLabel(step.riskLevel)}</span>
          </div>
        </div>

        {step.warnings.length > 0 && (
          <Card className="p-3 mb-5 bg-warning-soft border-amber-100">
            <ul className="text-xs text-amber-900 space-y-1">
              {step.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          </Card>
        )}

        <SectionTitle>Что нужно сделать</SectionTitle>
        <div className="space-y-2">
          {step.checklist.map((item) => {
            const checked = stepProgress?.checklist[item.id] ?? false;
            return (
              <Card key={item.id} className="p-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canGuestMarkSteps(user)) {
                        void useAuthStore.getState().requestAccess(`/app/deal/step/${step.id}`);
                        return;
                      }
                      toggleChecklistItem(step.id, item.id);
                    }}
                    className={`w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-colors ${
                      checked ? 'bg-accent border-accent text-white' : 'border-gray-200'
                    }`}
                  >
                    {checked && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-graphite text-sm">{item.title}</p>
                      {item.mandatory && (
                        <span className="text-[10px] font-semibold text-risk uppercase shrink-0">
                          Обязательно
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-graphite-muted mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {primaryTutorialId && (
          <button
            type="button"
            onClick={() => setSelectedTutorialId(primaryTutorialId)}
            className="mt-4 w-full text-left p-4 rounded-2xl border border-accent/20 bg-accent-soft/40 hover:bg-accent-soft transition-colors"
          >
            <p className="text-sm font-semibold text-accent flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Открыть подробную инструкцию
            </p>
            <p className="text-xs text-graphite-muted mt-1">
              {tutorial?.subtasks?.length
                ? `${tutorial.subtasks.length} подзадач с пошаговыми действиями и ссылками${
                    tutorialSubtaskPct > 0 ? ` · ${tutorialSubtaskPct}%` : ''
                  }`
                : 'Пошаговая инструкция с ответами и ссылками'}
            </p>
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
          className="mt-4 w-full text-left p-4 rounded-[20px] border border-gray-100 bg-white shadow-soft hover:border-accent/20 transition-colors"
        >
          <p className="text-sm font-semibold text-graphite flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent" />
            Что делать если…
          </p>
          <p className="text-xs text-graphite-muted mt-1">
            Экстренные сценарии и пошаговые действия
          </p>
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
