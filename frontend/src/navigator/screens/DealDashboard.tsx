import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import {
  calculateDealProgress,
  getCurrentStepIndex,
  getNextIncompleteStep
} from '../engine/buildDeal';
import { Header } from '../components/Header';
import {
  Card,
  DangerButton,
  EmptyState,
  PageShell,
  PrimaryButton,
  ProgressBar,
  RiskCard,
  SecondaryButton,
  SectionTitle,
  StepStatusIcon
} from '../components/ui';
import { canAccessFullRiskEngine, resolveEffectivePlan } from '../engine/planAccess';
import { LoginButton } from '../../components/LoginButton';
import { GuestBanner } from '../components/GuestBanner';
import { quizRiskLevelLabel } from '../engine/quizRiskScore';
import { useAuthStore } from '../../auth/store';
import { saveDealScroll, readDealScroll } from '../hooks/navigationPersistence';
import { useScrollRestore } from '../hooks/useScrollRestore';
import { useNavigator } from '../store/NavigatorContext';

const PHASE_LABELS: Record<string, string> = {
  preparation: 'Подготовка',
  selection: 'Подбор',
  object_check: 'Проверка объекта',
  advance: 'Аванс',
  mortgage: 'Ипотека',
  contract: 'ДКП',
  payments: 'Расчёты',
  signing: 'Подписание',
  registration: 'Регистрация',
  handover: 'Передача',
  after_deal: 'После сделки',
  marketing: 'Продажа'
};

export const DealDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { deal, progress, openStep, resetDeal, deleteActiveDeal, setDrawerOpen, completeDeal, openLeadModal } =
    useNavigator();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const scrollRef = useScrollRestore(saveDealScroll, readDealScroll, 'restoreScrollY');
  const plan = resolveEffectivePlan(user, progress);

  if (!deal || !progress) {
    return (
      <PageShell>
        <EmptyState
          icon={<span className="text-2xl">⌂</span>}
          title="Сделка ещё не начата"
          description="Ответьте на несколько вопросов — мы определим сценарий и построим план сделки."
          action={
            <PrimaryButton onClick={() => resetDeal()}>Проверить сделку</PrimaryButton>
          }
        />
      </PageShell>
    );
  }

  const stepIds = deal.steps.map((s) => s.id);
  const percent = calculateDealProgress(progress, stepIds);
  const completedCount = stepIds.filter(
    (id) => progress.steps[id]?.status === 'completed'
  ).length;
  const currentIdx = getCurrentStepIndex(deal.steps, progress);
  const nextStep = getNextIncompleteStep(deal, progress);
  const stepNumber = currentIdx + 1;
  const isDealCompleted = progress.status === 'completed';

  return (
    <PageShell className="pb-2 overflow-y-auto" noPadding>
      <Header
        logo
        showMenu
        onMenu={() => setDrawerOpen(true)}
        title="Моя сделка"
        rightSlot={<LoginButton redirectPath="/app/deal" showProfileWhenAuthed />}
      />
      <div ref={scrollRef} className="px-4 space-y-5 pb-4 overflow-y-auto">
        <div>
          <p className="text-xs text-graphite-muted mb-1">Ваш сценарий</p>
          <h2 className="text-xl font-semibold text-graphite tracking-tight leading-tight">
            {deal.displayTitle}
          </h2>
          <p className="text-xs text-graphite-muted mt-1">
            Сложность {deal.complexity}/10
            {deal.riskScore > 0 && ` · балл риска ${deal.riskScore}`}
          </p>
        </div>

        {deal.warnings.map((w) => (
          <Card key={w.id} className="p-5 bg-warning-soft">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-semibold text-amber-900">{w.title}</p>
                <p className="text-desc text-amber-800 mt-1 leading-relaxed">{w.body}</p>
              </div>
            </div>
          </Card>
        ))}

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-graphite">{percent}% завершено</span>
            <span className="text-graphite-muted">
              {completedCount} из {deal.steps.length} шагов
            </span>
          </div>
          <ProgressBar value={percent} />
        </div>

        <RiskCard
          level={deal.aggregateRisk}
          factorCount={
            canAccessFullRiskEngine(plan)
              ? deal.riskFactors.length
              : Math.min(deal.riskFactors.length, 2)
          }
        />
        {!canAccessFullRiskEngine(plan) && deal.riskFactors.length > 0 && (
          <p className="text-xs text-graphite-muted -mt-3">
            Полный разбор рисков — в тарифе «Безопасный». Сейчас: {quizRiskLevelLabel(deal.quizRiskLevel)}.
          </p>
        )}

        <Card className="p-6 overflow-hidden">
          <p className="text-desc font-medium text-graphite-muted uppercase tracking-wide mb-4">
            Следующий шаг
          </p>
          <div className="flex gap-4">
            <div className="w-11 h-11 rounded-btn bg-accent text-white flex items-center justify-center font-semibold text-lg shrink-0">
              {stepNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-graphite leading-snug">{nextStep.title}</p>
              <p className="text-desc text-graphite-muted mt-2 line-clamp-2 leading-relaxed">
                {nextStep.shortDescription}
              </p>
            </div>
          </div>
          <PrimaryButton
            className="mt-4"
            onClick={() => openStep(nextStep.id, scrollRef.current?.scrollTop ?? 0)}
          >
            Открыть шаг <ArrowRight className="inline w-4 h-4 ml-1 -mt-0.5" />
          </PrimaryButton>
        </Card>

        <SectionTitle>Ваш план сделки</SectionTitle>
        <div className="flex flex-col gap-3 pt-1">
          {!isDealCompleted && percent === 100 && (
            <PrimaryButton onClick={completeDeal}>Завершить сделку</PrimaryButton>
          )}
          {isDealCompleted && (
            <Card className="p-5 bg-green-50">
              <p className="text-base font-semibold text-green-800">Сделка завершена</p>
              <p className="text-desc text-green-700 mt-2 leading-relaxed">
                Все этапы пройдены. Вы можете начать новую сделку из раздела «Мои сделки».
              </p>
            </Card>
          )}
          <SecondaryButton onClick={openLeadModal}>Получить консультацию</SecondaryButton>
          {confirmDelete ? (
            <Card className="p-5 bg-red-50/50">
              <p className="text-base text-graphite mb-4 leading-relaxed">
                Удалить эту сделку? Прогресс и чек-листы будут удалены без возможности восстановления.
              </p>
              <div className="flex gap-3">
                <SecondaryButton className="!min-h-[44px]" onClick={() => setConfirmDelete(false)}>
                  Отмена
                </SecondaryButton>
                <DangerButton
                  className="!min-h-[44px]"
                  onClick={() => {
                    deleteActiveDeal();
                    setConfirmDelete(false);
                  }}
                >
                  Удалить
                </DangerButton>
              </div>
            </Card>
          ) : (
            <DangerButton outline onClick={() => setConfirmDelete(true)}>
              Удалить сделку
            </DangerButton>
          )}
        </div>

        <div className="space-y-3 pt-2">
          {deal.steps.map((step, index) => {
            const st = progress.steps[step.id]?.status ?? 'not_started';
            const isCurrent = index === currentIdx && st !== 'completed';
            const isDone = st === 'completed';

            return (
              <StepCard
                key={step.id}
                title={step.title}
                phase={PHASE_LABELS[step.phase] ?? step.phase}
                isDone={isDone}
                isCurrent={isCurrent}
                onClick={() => openStep(step.id, scrollRef.current?.scrollTop ?? 0)}
              />
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};

const StepCard: React.FC<{
  title: string;
  phase: string;
  isDone: boolean;
  isCurrent: boolean;
  onClick: () => void;
}> = ({ title, phase, isDone, isCurrent, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`step-card w-full text-left flex gap-4 items-start ${
      isCurrent ? 'step-card--current' : ''
    }`}
  >
    <StepStatusIcon status={isDone ? 'done' : isCurrent ? 'current' : 'pending'} />
    <div className="flex-1 min-w-0 pt-0.5">
      <p
        className={`text-base font-medium leading-snug ${
          isCurrent ? 'text-accent' : isDone ? 'text-graphite-muted line-through' : 'text-graphite'
        }`}
      >
        {title}
      </p>
      <p className="text-desc text-graphite-muted mt-1.5">{phase}</p>
    </div>
  </button>
);
