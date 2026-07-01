export const YANDEX_METRIKA_ID = 110270349;

export function metrikaHit(url: string, options?: { title?: string; referer?: string }) {
  if (typeof window.ym !== 'function') return;
  window.ym(YANDEX_METRIKA_ID, 'hit', url, options);
}

export function metrikaReachGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window.ym !== 'function') return;
  window.ym(YANDEX_METRIKA_ID, 'reachGoal', goal, params);
}
