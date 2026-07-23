import React from 'react';
import { AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import {
  calculateDealProgress,
  getCurrentStepIndex,
  getNextIncompleteStep
} from '../engine/buildDeal';
import { Header } from '../components/Header';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  DangerButton,
  EmptyState,
  FeatureRow,
  IconBox,
  PageShell,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  SectionTitle,
  StepRow
} from '../components/ui';
import { LoginButton } from '../../components/LoginButton';
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
  const { deal, progress, openStep, resetDeal, deleteActiveDeal, setDrawerOpen, completeDeal, openLeadModal } =
    useNavigator();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const scrollRef = useScrollRestore(saveDealScroll, readDealScroll, 'restoreScrollY');

  if (!deal || !progress) {
    return (
      <PageShell>
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
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
    <PageShell className="pb-2 flex-1 min-h-0" noPadding>
      <Header
        showMenu
        onMenu={() => setDrawerOpen(true)}
        title="Моя сделка"
        rightSlot={<LoginButton redirectPath="/app/deal" showProfileWhenAuthed />}
      />
      <div ref={scrollRef} className="page-content space-y-5 pb-4 flex-1 overflow-y-auto min-h-0">
        <div className="min-w-0 max-w-full">
          <p className="text-desc text-graphite-muted mb-1">Ваш сценарий</p>
          <h2 className="text-h2 text-graphite text-safe leading-tight">{deal.displayTitle}</h2>
          <p className="text-desc text-graphite-muted mt-1 text-safe">
            Сложность {deal.complexity}/10
            {deal.riskScore > 0 && ` · балл риска ${deal.riskScore}`}
          </p>
        </div>

        {deal.warnings.map((w) => (
          <Card key={w.id} tone="warning">
            <FeatureRow
              icon={<AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />}
              title={<span className="font-semibold text-amber-900">{w.title}</span>}
              description={<span className="text-amber-800">{w.body}</span>}
            />
          </Card>
        ))}

        <div>
          <div className="flex justify-between text-sm mb-2 min-w-0 gap-3">
            <span className="font-medium text-graphite text-safe shrink-0">{percent}% завершено</span>
            <span className="text-graphite-muted text-safe text-right">
              {completedCount} из {deal.steps.length} шагов
            </span>
          </div>
          <ProgressBar value={percent} />
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <p className="text-desc font-medium text-graphite-muted uppercase tracking-wide">
              Следующий шаг
            </p>
          </CardHeader>
          <CardContent>
            <FeatureRow
              icon={
                <IconBox size="md" className="bg-accent text-white font-semibold text-lg">
                  {stepNumber}
                </IconBox>
              }
              title={nextStep.title}
              description={nextStep.shortDescription}
            />
          </CardContent>
          <CardFooter>
            <PrimaryButton
              onClick={() => openStep(nextStep.id, scrollRef.current?.scrollTop ?? 0)}
            >
              Открыть шаг <ArrowRight className="inline w-4 h-4 ml-1 -mt-0.5" />
            </PrimaryButton>
          </CardFooter>
        </Card>

        <SectionTitle>Ваш план сделки</SectionTitle>
        <div className="flex flex-col gap-3 pt-1">
          {!isDealCompleted && percent === 100 && (
            <PrimaryButton onClick={completeDeal}>Завершить сделку</PrimaryButton>
          )}
          {isDealCompleted && (
            <Card tone="success">
              <p className="text-body font-semibold text-green-800 text-safe">Сделка завершена</p>
              <p className="text-desc text-green-700 mt-2 text-safe leading-relaxed">
                Все этапы пройдены. Вы можете начать новую сделку из раздела «Мои сделки».
              </p>
            </Card>
          )}
          <SecondaryButton onClick={openLeadModal}>Получить консультацию</SecondaryButton>
          {confirmDelete ? (
            <Card tone="danger">
              <p className="text-body text-graphite mb-4 text-safe leading-relaxed">
                Удалить эту сделку? Прогресс и чек-листы будут удалены без возможности восстановления.
              </p>
              <div className="flex gap-3 min-w-0">
                <SecondaryButton className="!min-h-[44px] flex-1 min-w-0" onClick={() => setConfirmDelete(false)}>
                  Отмена
                </SecondaryButton>
                <DangerButton
                  className="!min-h-[44px] flex-1 min-w-0"
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
              <StepRow
                key={step.id}
                status={isDone ? 'done' : isCurrent ? 'current' : 'pending'}
                title={step.title}
                description={PHASE_LABELS[step.phase] ?? step.phase}
                onClick={() => openStep(step.id, scrollRef.current?.scrollTop ?? 0)}
              />
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};
