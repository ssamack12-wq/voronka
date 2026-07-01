import { getEffectiveDealIntent } from '../onboarding/dealQuestions';
import { getScenario } from '../data/scenarios';
import type {
  DealIntent,
  DealWarning,
  QuizAnswers,
  ScenarioConditions
} from '../types';
import {
  buildDetectedRiskLabels,
  calculateQuizRiskScore,
  hasUnknownAnswers,
  quizRiskLevelFromScore
} from './quizRiskScore';

export interface ResolvedScenario {
  scenarioId: string;
  conditions: ScenarioConditions;
  displayTitle: string;
  riskScore: number;
  quizRiskLevel: 'low' | 'medium' | 'high';
  detectedRisks: string[];
  warnings: DealWarning[];
  complexity: number;
}

function resolveCoreScenarioId(intent: DealIntent, mortgage: boolean): string {
  switch (intent) {
    case 'buy_apartment':
      return mortgage ? 'buy-secondary-mortgage' : 'buy-secondary-cash';
    case 'buy_newbuilding':
      return 'buy-newbuilding';
    case 'sell_apartment':
      return mortgage ? 'sell-mortgage' : 'sell-secondary';
    case 'buy_land':
      return 'buy-land';
    case 'sell_land':
      return 'sell-land';
    default:
      return 'buy-secondary-cash';
  }
}

function buildDisplayTitle(intent: DealIntent, mortgage: boolean): string {
  switch (intent) {
    case 'buy_apartment':
      return mortgage ? 'Покупка вторички с ипотекой' : 'Покупка вторички';
    case 'buy_newbuilding':
      return mortgage ? 'Покупка новостройки с ипотекой' : 'Покупка новостройки';
    case 'sell_apartment':
      return mortgage ? 'Продажа ипотечной квартиры' : 'Продажа вторички';
    case 'buy_land':
      return 'Покупка участка';
    case 'sell_land':
      return 'Продажа участка';
    default:
      return 'Сделка с недвижимостью';
  }
}

function resolveDealIntent(answers: QuizAnswers) {
  return getEffectiveDealIntent(answers.intent, answers.housingType) ?? answers.intent;
}

function buildConditions(answers: QuizAnswers): ScenarioConditions {
  const dealIntent = resolveDealIntent(answers);
  const isBuy =
    dealIntent === 'buy_apartment' ||
    dealIntent === 'buy_newbuilding' ||
    dealIntent === 'buy_land';
  const unknownFields = answers.unknownFields ?? [];

  return {
    mortgage: answers.mortgage,
    matcapital: answers.matcapital,
    power_of_attorney: answers.powerOfAttorney,
    minors: answers.minors,
    alternative: answers.alternative,
    multiple_owners: answers.multipleOwners,
    less_than_3_years: answers.lessThan3Years === 'yes',
    newbuilding: dealIntent === 'buy_newbuilding',
    cash_only: isBuy && !answers.mortgage,
    uncertainty: unknownFields.length > 0,
    verify_poa: unknownFields.includes('poa'),
    verify_minors: unknownFields.includes('minors'),
    verify_alternative: unknownFields.includes('alternative'),
    verify_owners: unknownFields.includes('owners')
  };
}

function buildWarnings(answers: QuizAnswers): DealWarning[] {
  const warnings: DealWarning[] = [];

  if (answers.lessThan3Years === 'yes') {
    warnings.push({
      id: 'warn-less-3y',
      title: 'Объект в собственности менее 3 лет',
      body: 'Возможны налоговые риски и повышенная вероятность оспаривания сделки. Рекомендуем усиленную проверку документов.',
      severity: 'high'
    });
  }

  if (answers.lessThan3Years === 'unknown') {
    warnings.push({
      id: 'warn-less-3y-unknown',
      title: 'Срок владения неизвестен',
      body: 'Уточните дату регистрации права в выписке ЕГРН — от этого зависят налоги и риски оспаривания.',
      severity: 'warning'
    });
  }

  if (hasUnknownAnswers(answers)) {
    warnings.push({
      id: 'warn-unknown-params',
      title: 'Не все параметры сделки определены',
      body: 'Мы подготовили расширенный сценарий сделки, чтобы вы не пропустили важные проверки. По мере уточнения деталей обновите ответы в квизе.',
      severity: 'warning'
    });
  }

  return warnings;
}

function calculateComplexity(baseComplexity: number, riskScore: number): number {
  return Math.min(10, baseComplexity + Math.min(3, Math.floor(riskScore / 2)));
}

/** Default answers when starting from manual scenario picker (advanced) */
export function scenarioIdToQuizAnswers(scenarioId: string): QuizAnswers {
  const scenario = getScenario(scenarioId);
  const c = scenario?.conditions ?? {};
  let intent: QuizAnswers['intent'] = 'buy_apartment';
  if (scenarioId === 'buy-newbuilding') {
    return {
      intent: 'buy_apartment',
      housingType: 'newbuilding',
      mortgage: c.mortgage ?? false,
      matcapital: c.matcapital ?? false,
      powerOfAttorney: c.power_of_attorney ?? false,
      minors: c.minors ?? false,
      alternative: c.alternative ?? false,
      multipleOwners: c.multiple_owners ?? false,
      lessThan3Years: c.less_than_3_years ? 'yes' : 'no'
    };
  }
  if (scenarioId === 'buy-land') intent = 'buy_land';
  else if (scenarioId === 'sell-land') intent = 'sell_land';
  else if (scenario?.category === 'sell') intent = 'sell_apartment';

  return {
    intent,
    mortgage: c.mortgage ?? false,
    matcapital: c.matcapital ?? false,
    powerOfAttorney: c.power_of_attorney ?? false,
    minors: c.minors ?? false,
    alternative: c.alternative ?? false,
    multipleOwners: c.multiple_owners ?? false,
    lessThan3Years: c.less_than_3_years ? 'yes' : 'no'
  };
}

export function resolveScenario(answers: QuizAnswers): ResolvedScenario | null {
  const dealIntent = resolveDealIntent(answers);
  const scenarioId = resolveCoreScenarioId(dealIntent, answers.mortgage);
  const scenario = getScenario(scenarioId);
  if (!scenario) return null;

  const conditions = buildConditions(answers);
  const riskScore = calculateQuizRiskScore(answers);
  const quizRiskLevel = quizRiskLevelFromScore(riskScore);

  return {
    scenarioId,
    conditions,
    displayTitle: buildDisplayTitle(dealIntent, answers.mortgage),
    riskScore,
    quizRiskLevel,
    detectedRisks: buildDetectedRiskLabels(answers),
    warnings: buildWarnings(answers),
    complexity: calculateComplexity(scenario.complexity, riskScore)
  };
}
