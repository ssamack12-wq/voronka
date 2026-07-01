import { metrikaReachGoal } from '../analytics/yandexMetrika';

export type AnalyticsEvent =
  | 'started_quiz'
  | 'quiz_completed'
  | 'opened_roadmap'
  | 'selected_scenario'
  | 'opened_premium_paywall'
  | 'clicked_consultation'
  | 'completed_step'
  | 'completed_deal'
  | 'opened_tutorial'
  | 'requested_help';

export function trackEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', event, payload ?? {});
  }
  metrikaReachGoal(event, payload);
}
