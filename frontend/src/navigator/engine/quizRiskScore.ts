import type { QuizAnswers } from '../types';

export type QuizRiskLevel = 'low' | 'medium' | 'high';

export function countUnknownAnswers(answers: QuizAnswers): number {
  return answers.unknownFields?.length ?? 0;
}

export function hasUnknownAnswers(answers: QuizAnswers): boolean {
  return countUnknownAnswers(answers) > 0;
}

export function calculateQuizRiskScore(answers: QuizAnswers): number {
  let score = 0;
  if (answers.mortgage) score += 2;
  if (answers.powerOfAttorney) score += 3;
  if (answers.minors) score += 3;
  if (answers.alternative) score += 2;
  if (answers.multipleOwners) score += 1;
  if (answers.lessThan3Years === 'yes') score += 2;
  score += countUnknownAnswers(answers);
  return score;
}

export function quizRiskLevelFromScore(score: number): QuizRiskLevel {
  if (score <= 2) return 'low';
  if (score <= 5) return 'medium';
  return 'high';
}

export function quizRiskLevelLabel(level: QuizRiskLevel): string {
  const map: Record<QuizRiskLevel, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  };
  return map[level];
}

export function buildDetectedRiskLabels(answers: QuizAnswers): string[] {
  const risks: string[] = [];
  if (answers.mortgage) risks.push('ипотека');
  if (answers.matcapital) risks.push('маткапитал');
  if (answers.powerOfAttorney) risks.push('доверенность');
  if (answers.minors) risks.push('несовершеннолетние собственники');
  if (answers.alternative) risks.push('альтернативная сделка');
  if (answers.multipleOwners) risks.push('несколько собственников');
  if (answers.lessThan3Years === 'yes') risks.push('объект менее 3 лет в собственности');
  if (hasUnknownAnswers(answers)) risks.push('неопределённые параметры сделки');
  return risks;
}
