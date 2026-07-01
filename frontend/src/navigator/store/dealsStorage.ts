import { calculateDealProgress, buildDealFromProgress } from '../engine/buildDeal';
import type { DealProgress, DealSummary } from '../types';

const DEALS_KEY = 'tn-deals-v2';
const LEGACY_KEY = 'tn-deal-progress';

export interface DealsState {
  activeDealId: string | null;
  deals: DealProgress[];
}

function newDealId(): string {
  return crypto.randomUUID();
}

function withMeta(progress: DealProgress): DealProgress {
  const deal = buildDealFromProgress(progress);
  const stepIds = deal?.steps.map((s) => s.id) ?? [];
  const percent = stepIds.length ? calculateDealProgress(progress, stepIds) : 0;
  return {
    ...progress,
    id: progress.id ?? newDealId(),
    status: progress.status ?? 'active',
    updatedAt: progress.updatedAt ?? new Date().toISOString(),
    percent
  };
}

function migrateLegacy(): DealsState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const single = JSON.parse(raw) as DealProgress;
    localStorage.removeItem(LEGACY_KEY);
    const deal = withMeta({ ...single, id: single.id ?? newDealId() });
    return { activeDealId: deal.id!, deals: [deal] };
  } catch {
    return null;
  }
}

export function loadDealsState(): DealsState {
  try {
    const raw = localStorage.getItem(DEALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DealsState;
      return {
        activeDealId: parsed.activeDealId,
        deals: (parsed.deals ?? []).map(withMeta)
      };
    }
    const legacy = migrateLegacy();
    if (legacy) {
      saveDealsState(legacy);
      return legacy;
    }
  } catch {
    /* ignore */
  }
  return { activeDealId: null, deals: [] };
}

export function saveDealsState(state: DealsState): void {
  const normalized: DealsState = {
    activeDealId: state.activeDealId,
    deals: state.deals.map(withMeta)
  };
  localStorage.setItem(DEALS_KEY, JSON.stringify(normalized));
}

export function toDealSummary(progress: DealProgress): DealSummary {
  const deal = buildDealFromProgress(progress);
  const stepIds = deal?.steps.map((s) => s.id) ?? [];
  const percent = stepIds.length ? calculateDealProgress(progress, stepIds) : 0;
  const currentIdx = deal
    ? deal.steps.findIndex((s) => progress.steps[s.id]?.status !== 'completed')
    : 0;
  const currentStep = deal?.steps[currentIdx === -1 ? deal.steps.length - 1 : currentIdx];
  return {
    id: progress.id!,
    scenarioId: progress.scenarioId,
    displayTitle: progress.displayTitle ?? deal?.displayTitle ?? 'Сделка',
    status: progress.status ?? 'active',
    percent,
    updatedAt: progress.updatedAt ?? progress.startedAt,
    startedAt: progress.startedAt,
    currentStepTitle: currentStep?.title,
    completedAt: progress.completedAt
  };
}

export function ensureDealId(progress: DealProgress): DealProgress {
  return withMeta({ ...progress, id: progress.id ?? newDealId() });
}
