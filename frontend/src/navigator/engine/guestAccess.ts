import { DOCUMENT_LIBRARY } from '../data/documents';
import { buildDealFromResolved } from './buildDeal';
import { resolveScenario } from './resolveScenario';
import type { QuizAnswers, ResolvedDeal } from '../types';

/** Гость может просматривать сценарий, но не сохранять прогресс. */
export function isGuestUser(user: unknown): boolean {
  return !user;
}

export function canGuestSaveProgress(user: unknown): boolean {
  return !isGuestUser(user);
}

export function canGuestMarkSteps(user: unknown): boolean {
  return !isGuestUser(user);
}

export function canGuestUseCalendar(user: unknown): boolean {
  return !isGuestUser(user);
}

export function canGuestUseEmergency(user: unknown): boolean {
  return !isGuestUser(user);
}

/** Гость видит только часть документов. */
export const GUEST_VISIBLE_DOCS_COUNT = 3;

export function filterDocumentsForGuest<T extends { id: string }>(
  docs: T[],
  user: unknown
): T[] {
  if (!isGuestUser(user)) return docs;
  return docs.slice(0, GUEST_VISIBLE_DOCS_COUNT);
}

export interface DealPreviewStats {
  displayTitle: string;
  scenarioId: string;
  stepsCount: number;
  checksCount: number;
  documentsCount: number;
  hasCalendar: boolean;
  hasEmergency: boolean;
}

export function getDealPreviewStats(answers: QuizAnswers): DealPreviewStats | null {
  const resolved = resolveScenario(answers);
  if (!resolved) return null;
  const deal = buildDealFromResolved(resolved);
  if (!deal) return null;

  const category = deal.scenario.category;
  const docs = DOCUMENT_LIBRARY.filter(
    (d) => d.scenarioTags.includes(category) || d.scenarioTags.includes('buy') || d.scenarioTags.includes('sell')
  );

  return {
    displayTitle: resolved.displayTitle,
    scenarioId: resolved.scenarioId,
    stepsCount: deal.steps.length,
    checksCount: deal.steps.reduce((sum, s) => sum + s.checklist.length, 0),
    documentsCount: docs.length,
    hasCalendar: true,
    hasEmergency: true
  };
}

export function countDealDocuments(deal: ResolvedDeal): number {
  const category = deal.scenario.category;
  return DOCUMENT_LIBRARY.filter(
    (d) => d.scenarioTags.includes(category) || d.scenarioTags.includes('buy') || d.scenarioTags.includes('sell')
  ).length;
}
