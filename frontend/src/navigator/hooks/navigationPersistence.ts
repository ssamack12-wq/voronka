const SCROLL_KEY = 'tn-scroll-v1';

type ScrollStore = {
  deal?: number;
  steps?: Record<string, number>;
};

function readStore(): ScrollStore {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    return raw ? (JSON.parse(raw) as ScrollStore) : {};
  } catch {
    return {};
  }
}

function writeStore(next: ScrollStore): void {
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
}

export function isPageReload(): boolean {
  if (typeof performance === 'undefined') return false;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === 'reload';
}

export function saveDealScroll(scrollY: number): void {
  const store = readStore();
  writeStore({ ...store, deal: Math.max(0, scrollY) });
}

export function saveStepScroll(stepId: string, scrollY: number): void {
  const store = readStore();
  writeStore({
    ...store,
    steps: { ...store.steps, [stepId]: Math.max(0, scrollY) }
  });
}

export function readDealScroll(): number | undefined {
  const value = readStore().deal;
  return typeof value === 'number' ? value : undefined;
}

export function readStepScroll(stepId: string): number | undefined {
  const value = readStore().steps?.[stepId];
  return typeof value === 'number' ? value : undefined;
}

export function resolveScrollRestore(
  locationStateValue: unknown,
  persistedValue: number | undefined
): number | undefined {
  if (typeof locationStateValue === 'number') return locationStateValue;
  return persistedValue;
}
