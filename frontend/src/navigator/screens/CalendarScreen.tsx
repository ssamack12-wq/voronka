import { Calendar, Check } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store';
import { buildDealTimeline, getTodaySummary } from '../data/timeline';
import { Header } from '../components/Header';
import { canAccessDealCalendar, resolveEffectivePlan } from '../engine/planAccess';
import { canGuestUseCalendar } from '../engine/guestAccess';
import { Card, CardContent, CardHeader, EmptyState, FeatureRow, PageShell, PrimaryButton, SecondaryButton, SectionTitle } from '../components/ui';
import { useNavigator } from '../store/NavigatorContext';
import { SafeFeaturePaywall } from './SafeFeaturePaywall';

export const CalendarScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { deal, progress, setDrawerOpen, openStep, completeStep } = useNavigator();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const plan = resolveEffectivePlan(user, progress);
  const guestBlocked = !canGuestUseCalendar(user);
  const hasAccess = !guestBlocked && canAccessDealCalendar(plan);

  const timeline = useMemo(() => {
    if (!deal || !progress) return [];
    return buildDealTimeline(deal.steps, progress);
  }, [deal, progress]);

  const summary = useMemo(() => getTodaySummary(timeline), [timeline]);

  React.useEffect(() => {
    if (guestBlocked) {
      void useAuthStore.getState().requestAccess('/app/calendar');
      return;
    }
    if (!hasAccess && deal && progress) setPaywallOpen(true);
  }, [guestBlocked, hasAccess, deal, progress]);

  return (
    <PageShell noPadding className="overflow-y-auto">
      <Header logo showMenu onMenu={() => setDrawerOpen(true)} title="Календарь" />
      <div className="page-content pb-4">
        {!deal || !progress ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="Календарь сделки"
            description="Начните сделку — мы построим временную шкалу по вашему сценарию."
          />
        ) : !hasAccess ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="Календарь в тарифе Safe"
            description="Откройте календарь сделки и экстренные сценарии в тарифе «Безопасный»."
            action={
              <PrimaryButton onClick={() => setPaywallOpen(true)}>Оформить Safe</PrimaryButton>
            }
          />
        ) : (
          <>
            <Card className="mb-5 bg-gradient-to-br from-accent-soft/50 to-white border border-accent/10">
              <CardHeader>
                <p className="badge-eyebrow !text-graphite-muted !bg-surface">
                  {summary.todayLabel}
                </p>
              </CardHeader>
              <CardContent>
                {summary.current ? (
                  <>
                    <p className="text-h2 text-graphite leading-snug text-safe">{summary.current.title}</p>
                    <p className="text-small text-graphite-muted mt-1 text-safe">
                      Срок: {summary.current.dueLabel} · {summary.current.estimatedDuration}
                    </p>
                  </>
                ) : (
                  <p className="text-body text-graphite text-safe">Все шаги выполнены</p>
                )}
                {summary.next && (
                  <div className="mt-3 pt-3 border-t border-accent/10">
                    <p className="text-[11px] text-graphite-muted uppercase text-safe">Следующий шаг</p>
                    <p className="text-body font-medium text-graphite mt-0.5 text-safe">{summary.next.title}</p>
                    <p className="text-small text-graphite-muted text-safe">
                      День {summary.next.dayNumber} · {summary.next.dueLabel}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <SectionTitle sub="Автоматически построено по вашему сценарию">
              Временная шкала
            </SectionTitle>

            <div className="relative pl-1 space-y-0">
              {timeline.map((entry, index) => {
                const isLast = index === timeline.length - 1;
                const step = deal.steps.find((s) => s.id === entry.stepId);
                const statusLabel = entry.isDone
                  ? 'Выполнено'
                  : entry.status === 'in_progress'
                    ? 'В процессе'
                    : 'Не выполнено';

                return (
                  <div key={entry.stepId} className="flex gap-3 pb-4 min-w-0 max-w-full">
                    <div className="flex flex-col items-center shrink-0">
                      {entry.isDone ? (
                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-black/[0.08] flex items-center justify-center text-desc font-medium text-graphite-muted">
                          {entry.dayNumber}
                        </div>
                      )}
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 min-h-[24px] mt-1 ${
                            entry.isDone ? 'bg-green-200' : 'bg-black/[0.04]'
                          }`}
                        />
                      )}
                    </div>

                    <Card
                      className={`flex-1 min-w-0 ${
                        entry.isDone ? 'border-green-100 bg-green-50/40' : ''
                      }`}
                    >
                      <p className="text-small font-medium text-graphite-muted text-safe">
                        День {entry.dayNumber}
                      </p>
                      <p
                        className={`text-body font-semibold mt-0.5 leading-snug text-safe ${
                          entry.isDone ? 'text-green-800' : 'text-graphite'
                        }`}
                      >
                        {entry.title}
                      </p>
                      <dl className="mt-3 space-y-1.5 text-small">
                        <div className="dl-row">
                          <dt>Длительность</dt>
                          <dd className="text-graphite font-medium">{entry.estimatedDuration}</dd>
                        </div>
                        <div className="dl-row">
                          <dt>Срок</dt>
                          <dd className="text-graphite font-medium">{entry.dueLabel}</dd>
                        </div>
                        <div className="dl-row">
                          <dt>Статус</dt>
                          <dd
                            className={`font-medium ${
                              entry.isDone ? 'text-green-700' : 'text-graphite'
                            }`}
                          >
                            {statusLabel}
                          </dd>
                        </div>
                      </dl>
                      {!entry.isDone && step && (
                        <div className="mt-3 flex flex-col gap-2">
                          <SecondaryButton
                            onClick={() => openStep(entry.stepId)}
                            className="!min-h-[40px] !text-desc"
                          >
                            Открыть шаг
                          </SecondaryButton>
                          <PrimaryButton
                            onClick={() => completeStep(entry.stepId)}
                            className="!min-h-[40px] !text-desc"
                          >
                            Отметить выполненным
                          </PrimaryButton>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <SafeFeaturePaywall open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </PageShell>
  );
};
