import React from 'react';
import { AlertTriangle, ArrowRight, Check, Circle, CircleDot } from 'lucide-react';
import {
  calculateDealProgress,
  getCurrentStepIndex,
  getNextIncompleteStep
} from '../engine/buildDeal';
import { Header } from '../components/Header';
import {
  Card,
  EmptyState,
  PageShell,
  PrimaryButton,
  ProgressBar,
  RiskCard,
  SectionTitle
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
          <Card key={w.id} className="p-3 border-amber-200 bg-amber-50/90">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">{w.title}</p>
                <p className="text-xs text-amber-800 mt-0.5">{w.body}</p>
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

        <Card className="p-4 overflow-hidden">
          <p className="text-xs font-medium text-graphite-muted uppercase tracking-wide mb-3">
            Следующий шаг
          </p>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-lg shrink-0">
              {stepNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-graphite">{nextStep.title}</p>
              <p className="text-sm text-graphite-muted mt-1 line-clamp-2">
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
        <div className="flex flex-col gap-2 pt-2">
          {!isDealCompleted && percent === 100 && (
            <PrimaryButton onClick={completeDeal}>Завершить сделку</PrimaryButton>
          )}
          {isDealCompleted && (
            <Card className="p-4 bg-green-50 border-green-100">
              <p className="text-sm font-semibold text-green-800">Сделка завершена</p>
              <p className="text-xs text-green-700 mt-1">
                Все этапы пройдены. Вы можете начать новую сделку из раздела «Мои сделки».
              </p>
            </Card>
          )}
          <button
            type="button"
            onClick={openLeadModal}
            className="w-full py-3 rounded-2xl border border-gray-200 text-sm font-medium text-graphite"
          >
            Получить консультацию
          </button>
          {confirmDelete ? (
            <Card className="p-4 border-risk/20 bg-red-50/50">
              <p className="text-sm text-graphite mb-3">
                Удалить эту сделку? Прогресс и чек-листы будут удалены без возможности восстановления.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-graphite"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteActiveDeal();
                    setConfirmDelete(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-risk text-white text-sm font-semibold"
                >
                  Удалить
                </button>
              </div>
            </Card>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full py-3 rounded-2xl border border-red-100 text-sm font-medium text-risk"
            >
              Удалить сделку
            </button>
          )}
        </div>

        <div className="relative pl-1">
          {deal.steps.map((step, index) => {
            const st = progress.steps[step.id]?.status ?? 'not_started';
            const isCurrent = index === currentIdx && st !== 'completed';
            const isDone = st === 'completed';
            const isLast = index === deal.steps.length - 1;

            return (
              <TimelineItem
                key={step.id}
                title={step.title}
                phase={PHASE_LABELS[step.phase] ?? step.phase}
                isDone={isDone}
                isCurrent={isCurrent}
                isLast={isLast}
                onClick={() => openStep(step.id, scrollRef.current?.scrollTop ?? 0)}
              />
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};

const TimelineItem: React.FC<{
  title: string;
  phase: string;
  isDone: boolean;
  isCurrent: boolean;
  isLast: boolean;
  onClick: () => void;
}> = ({ title, phase, isDone, isCurrent, isLast, onClick }) => (
  <button type="button" onClick={onClick} className="flex gap-3 w-full text-left pb-4 group">
    <div className="flex flex-col items-center shrink-0">
      {isDone ? (
        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white stroke-[3]" />
        </div>
      ) : isCurrent ? (
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center ring-4 ring-accent/20">
          <CircleDot className="w-3.5 h-3.5 text-white fill-white" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white">
          <Circle className="w-3 h-3 text-gray-300" />
        </div>
      )}
      {!isLast && (
        <div
          className={`w-0.5 flex-1 min-h-[24px] mt-1 ${
            isDone ? 'bg-green-200' : 'bg-gray-100'
          }`}
        />
      )}
    </div>
    <div
      className={`flex-1 pt-0.5 pb-1 rounded-xl transition-colors ${
        isCurrent ? 'bg-accent-soft/60 -mx-2 px-2' : 'group-hover:bg-gray-50 -mx-2 px-2'
      }`}
    >
      <p
        className={`text-sm font-medium leading-snug ${
          isCurrent ? 'text-accent' : isDone ? 'text-graphite-muted' : 'text-graphite'
        }`}
      >
        {title}
      </p>
      {isCurrent && (
        <p className="text-[11px] text-graphite-muted mt-0.5">{phase}</p>
      )}
    </div>
  </button>
);
