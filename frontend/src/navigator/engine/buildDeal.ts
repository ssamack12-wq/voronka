import { getScenario } from '../data/scenarios';
import { getSteps } from '../data/steps';
import type {
  DealProgress,
  DealWarning,
  PlanTier,
  QuizAnswers,
  ResolvedDeal,
  ScenarioConditions,
  ScenarioDefinition
} from '../types';
import { applyRules, getRiskFactors } from './rulesEngine';
import { aggregateRisk, quizRiskLevelToAggregate } from './riskScoring';
import { normalizePlan } from './planAccess';
import type { ResolvedScenario } from './resolveScenario';
import { resolveScenario } from './resolveScenario';

export interface BuildDealOptions {
  conditions?: ScenarioConditions;
  displayTitle?: string;
  riskScore?: number;
  quizRiskLevel?: 'low' | 'medium' | 'high';
  warnings?: DealWarning[];
  complexity?: number;
}

export function buildDeal(scenarioId: string, options: BuildDealOptions = {}): ResolvedDeal | null {
  const scenario = getScenario(scenarioId);
  if (!scenario) return null;

  const conditions: ScenarioConditions = {
    ...scenario.conditions,
    ...options.conditions
  };

  const { stepIds, riskFactorIds } = applyRules(scenario.baseStepIds, conditions, scenario);
  const steps = getSteps(stepIds);
  const riskFactors = getRiskFactors(riskFactorIds);

  const riskScore = options.riskScore ?? 0;
  const quizRiskLevel = options.quizRiskLevel ?? 'low';
  const aggregateRiskLevel =
    options.quizRiskLevel != null
      ? quizRiskLevelToAggregate(quizRiskLevel)
      : aggregateRisk(scenario.baseRisk, riskFactors, steps);

  const displayScenario: ScenarioDefinition = options.displayTitle
    ? { ...scenario, title: options.displayTitle }
    : scenario;

  return {
    scenario: displayScenario,
    steps,
    riskFactors,
    aggregateRisk: aggregateRiskLevel,
    warnings: options.warnings ?? [],
    riskScore,
    quizRiskLevel,
    displayTitle: options.displayTitle ?? scenario.title,
    complexity: options.complexity ?? scenario.complexity
  };
}

export function buildDealFromResolved(resolved: ResolvedScenario): ResolvedDeal | null {
  return buildDeal(resolved.scenarioId, {
    conditions: resolved.conditions,
    displayTitle: resolved.displayTitle,
    riskScore: resolved.riskScore,
    quizRiskLevel: resolved.quizRiskLevel,
    warnings: resolved.warnings,
    complexity: resolved.complexity
  });
}

export function createInitialProgress(
  resolved: ResolvedScenario,
  answers: QuizAnswers,
  plan: PlanTier = 'base'
): DealProgress {
  const deal = buildDealFromResolved(resolved);
  const steps: DealProgress['steps'] = {};

  deal?.steps.forEach((step) => {
    steps[step.id] = {
      status: 'not_started',
      checklist: Object.fromEntries(step.checklist.map((c) => [c.id, false]))
    };
  });

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    scenarioId: resolved.scenarioId,
    startedAt: now,
    updatedAt: now,
    status: 'active',
    steps,
    plan,
    conditions: resolved.conditions,
    quizAnswers: answers,
    riskScore: resolved.riskScore,
    displayTitle: resolved.displayTitle
  };
}

export function createProgressFromQuiz(answers: QuizAnswers, plan: PlanTier = 'base'): DealProgress | null {
  const resolved = resolveScenario(answers);
  if (!resolved) return null;
  return createInitialProgress(resolved, answers, plan);
}

/** Rebuild deal view from stored progress */
export function buildDealFromProgress(progress: DealProgress): ResolvedDeal | null {
  if (progress.quizAnswers) {
    const resolved = resolveScenario(progress.quizAnswers);
    if (resolved) {
      return buildDealFromResolved({
        ...resolved,
        displayTitle: progress.displayTitle ?? resolved.displayTitle,
        riskScore: progress.riskScore ?? resolved.riskScore
      });
    }
  }

  return buildDeal(progress.scenarioId, {
    conditions: progress.conditions,
    displayTitle: progress.displayTitle,
    riskScore: progress.riskScore
  });
}

export function migrateProgress(raw: DealProgress): DealProgress {
  return {
    ...raw,
    plan: normalizePlan(raw)
  };
}

export function getScenarioTitle(scenario: ScenarioDefinition): string {
  return scenario.title;
}

export function calculateDealProgress(progress: DealProgress, dealStepIds: string[]): number {
  if (dealStepIds.length === 0) return 0;
  const completed = dealStepIds.filter(
    (id) => progress.steps[id]?.status === 'completed'
  ).length;
  return Math.round((completed / dealStepIds.length) * 100);
}

export function getCurrentStepIndex(
  steps: ResolvedDeal['steps'],
  progress: DealProgress
): number {
  const idx = steps.findIndex((s) => progress.steps[s.id]?.status !== 'completed');
  return idx === -1 ? steps.length - 1 : idx;
}

export function getNextIncompleteStep(deal: ResolvedDeal, progress: DealProgress) {
  return (
    deal.steps.find((s) => progress.steps[s.id]?.status !== 'completed') ??
    deal.steps[deal.steps.length - 1]
  );
}

export function isStepComplete(progress: DealProgress, stepId: string): boolean {
  const step = progress.steps[stepId];
  if (!step) return false;
  return step.status === 'completed';
}

export function canCompleteStep(progress: DealProgress, stepId: string): boolean {
  const step = progress.steps[stepId];
  if (!step) return true;
  return step.status !== 'completed';
}

export function checklistProgress(progress: DealProgress, stepId: string): number {
  const step = progress.steps[stepId];
  if (!step) return 0;
  const entries = Object.values(step.checklist);
  if (entries.length === 0) return 100;
  const done = entries.filter(Boolean).length;
  return Math.round((done / entries.length) * 100);
}

export function subtaskProgress(
  progress: DealProgress,
  stepId: string,
  subtaskIds: string[]
): number {
  if (subtaskIds.length === 0) return 0;
  const step = progress.steps[stepId];
  if (!step?.subtasks) return 0;
  const done = subtaskIds.filter((id) => step.subtasks?.[id] === true).length;
  return Math.round((done / subtaskIds.length) * 100);
}
