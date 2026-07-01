import type { DealStep, DealProgress, StepStatus } from '../types';

export interface TimelineEntry {
  stepId: string;
  title: string;
  dayNumber: number;
  dueLabel: string;
  estimatedDuration: string;
  status: StepStatus;
  isDone: boolean;
}

/** Длительность для карточек календаря (отдельно от estimatedTime шага). */
const CALENDAR_DURATION: Record<string, string> = {
  'object-egrn': '5–15 минут',
  'object-seller': '20 минут',
  'dkp-prepare': '1 день',
  'prep-mortgage-approval': '3–14 дней',
  'registration-submit': '1 день',
  'registration-track': '7–9 рабочих дней',
  'handover-act': '1 день',
  'handover-utilities': '1 день',
  'nb-ddu-sign': '1 день',
  'nb-acceptance': '1 день'
};

const STEP_DAY_OVERRIDE: Record<string, number> = {
  'registration-track': 12,
  'handover-act': 13,
  'handover-utilities': 13,
  'after-tax-deduction': 14,
  'nb-acceptance': 30,
  'nb-registration': 28
};

const PHASE_BASE_DAY: Record<string, number> = {
  preparation: 1,
  marketing: 1,
  selection: 1,
  object_check: 1,
  advance: 3,
  mortgage: 4,
  contract: 4,
  payments: 5,
  signing: 5,
  registration: 5,
  handover: 13,
  after_deal: 14
};

const PHASE_DAY_INCREMENT: Record<string, number> = {
  preparation: 0,
  marketing: 0,
  selection: 0,
  object_check: 0,
  advance: 1,
  mortgage: 1,
  contract: 1,
  payments: 0,
  signing: 0,
  registration: 7,
  handover: 1,
  after_deal: 1
};

function formatDueLabel(dayNumber: number, startedAt: string, today = new Date()): string {
  const start = new Date(startedAt);
  start.setHours(0, 0, 0, 0);
  const due = new Date(start);
  due.setDate(due.getDate() + dayNumber - 1);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);

  if (due.getTime() === t.getTime()) return 'Сегодня';
  if (due.getTime() < t.getTime()) return 'Просрочено';
  const diff = Math.round((due.getTime() - t.getTime()) / 86400000);
  if (diff === 1) return 'Завтра';
  if (diff <= 7) return `Через ${diff} дн.`;
  return due.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function getCalendarDuration(stepId: string, fallback?: string): string {
  return CALENDAR_DURATION[stepId] ?? fallback ?? '1 день';
}

function resolveDayNumber(step: DealStep, phaseCounters: Record<string, number>): number {
  if (STEP_DAY_OVERRIDE[step.id] != null) return STEP_DAY_OVERRIDE[step.id];

  const phase = step.phase;
  const base = PHASE_BASE_DAY[phase] ?? 1;
  const counter = phaseCounters[phase] ?? 0;
  const increment = PHASE_DAY_INCREMENT[phase] ?? 0;
  phaseCounters[phase] = counter + 1;

  if (counter === 0) return base;
  if (increment > 0) return base + counter * increment;
  return base + Math.min(counter, 2);
}

/** Строит временную шкалу сделки из упорядоченных шагов сценария. */
export function buildDealTimeline(
  steps: DealStep[],
  progress: DealProgress,
  startedAt: string = progress.startedAt
): TimelineEntry[] {
  const phaseCounters: Record<string, number> = {};

  return steps.map((step) => {
    const stepProgress = progress.steps[step.id];
    const status = stepProgress?.status ?? 'not_started';
    const isDone = status === 'completed';
    const dayNumber = resolveDayNumber(step, phaseCounters);

    return {
      stepId: step.id,
      title: step.title,
      dayNumber,
      dueLabel: formatDueLabel(dayNumber, startedAt),
      estimatedDuration: getCalendarDuration(step.id, step.estimatedTime),
      status,
      isDone
    };
  });
}

export function getTodaySummary(entries: TimelineEntry[]): {
  todayLabel: string;
  current?: TimelineEntry;
  next?: TimelineEntry;
} {
  const pending = entries.filter((e) => !e.isDone);
  const current =
    pending.find((e) => e.dueLabel === 'Сегодня' || e.dueLabel === 'Просрочено') ?? pending[0];
  const next = pending.find((e) => e !== current);

  return {
    todayLabel: 'Сегодня',
    current,
    next
  };
}
