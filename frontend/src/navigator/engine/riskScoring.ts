import type { DealStep, RiskFactor, RiskLevel } from '../types';
import type { QuizRiskLevel } from './quizRiskScore';

const RISK_WEIGHT: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const RISK_ORDER: RiskLevel[] = ['low', 'medium', 'high', 'critical'];

export function aggregateRisk(
  baseRisk: RiskLevel,
  factors: RiskFactor[],
  steps: DealStep[]
): RiskLevel {
  let score = RISK_WEIGHT[baseRisk];

  factors.forEach((f) => {
    score += RISK_WEIGHT[f.level];
  });

  const highSteps = steps.filter((s) => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
  score += Math.min(highSteps, 3);

  if (score >= 10) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

export function riskLabel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический'
  };
  return map[level];
}

export function riskColorClasses(level: RiskLevel): { bg: string; text: string; border: string } {
  const map: Record<RiskLevel, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    medium: { bg: 'bg-warning-soft', text: 'text-amber-800', border: 'border-amber-100' },
    high: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-100' },
    critical: { bg: 'bg-red-50', text: 'text-risk', border: 'border-red-100' }
  };
  return map[level];
}

export function compareRisk(a: RiskLevel, b: RiskLevel): number {
  return RISK_ORDER.indexOf(a) - RISK_ORDER.indexOf(b);
}

export function quizRiskLevelToAggregate(level: QuizRiskLevel): RiskLevel {
  if (level === 'low') return 'low';
  if (level === 'medium') return 'medium';
  return 'high';
}
