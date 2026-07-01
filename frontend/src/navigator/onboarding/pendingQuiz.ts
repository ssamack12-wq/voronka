import { createProgressFromQuiz } from '../engine/buildDeal';
import type { DealProgress, PlanTier, QuizAnswers } from '../types';

const PENDING_QUIZ_KEY = 'tn-pending-quiz';

export interface PendingQuizPayload {
  answers: QuizAnswers;
  plan?: PlanTier;
}

export function savePendingQuiz(payload: PendingQuizPayload): void {
  try {
    sessionStorage.setItem(PENDING_QUIZ_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function loadPendingQuiz(): PendingQuizPayload | null {
  try {
    const raw = sessionStorage.getItem(PENDING_QUIZ_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingQuizPayload;
    if (!parsed?.answers?.intent) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingQuiz(): void {
  try {
    sessionStorage.removeItem(PENDING_QUIZ_KEY);
  } catch {
    /* ignore */
  }
}

export function buildProgressFromPending(): DealProgress | null {
  const pending = loadPendingQuiz();
  if (!pending) return null;
  return createProgressFromQuiz(pending.answers, pending.plan ?? 'base');
}

export function hasPendingQuiz(): boolean {
  return loadPendingQuiz() !== null;
}
