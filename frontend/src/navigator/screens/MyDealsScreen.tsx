import { CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import React from 'react';
import { Header } from '../components/Header';
import { Card, EmptyState, FeatureRow, IconBox, PageShell, PrimaryButton, ProgressBar, SectionTitle } from '../components/ui';
import { useNavigator } from '../store/NavigatorContext';

export const MyDealsScreen: React.FC = () => {
  const { dealSummaries, progress, switchDeal, resetDeal, setDrawerOpen } = useNavigator();

  return (
    <PageShell className="pb-4 overflow-y-auto" noPadding>
      <Header showMenu onMenu={() => setDrawerOpen(true)} title="Мои сделки" />
      <div className="page-content space-y-4 pb-4">
        <PrimaryButton onClick={() => resetDeal()} className="!py-3">
          <Plus className="inline w-4 h-4 mr-1 -mt-0.5" />
          Новая сделка
        </PrimaryButton>

        {dealSummaries.length === 0 ? (
          <EmptyState
            icon={<span className="text-2xl">📋</span>}
            title="Сделок пока нет"
            description="Пройдите короткий квиз — мы определим сценарий и сохраним прогресс."
            action={
              <PrimaryButton onClick={() => resetDeal()}>Проверить сделку</PrimaryButton>
            }
          />
        ) : (
          <>
            <SectionTitle sub="Нажмите, чтобы открыть roadmap">Все сделки</SectionTitle>
            <div className="space-y-2">
              {dealSummaries.map((item) => {
                const isActive = progress?.id === item.id;
                const isDone = item.status === 'completed';
                return (
                  <Card
                    key={item.id}
                    onClick={() => switchDeal(item.id)}
                    className={isActive ? 'ring-2 ring-accent/30' : ''}
                  >
                    <FeatureRow
                      icon={
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isDone ? 'bg-green-50 text-green-600' : 'bg-accent-soft text-accent'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-semibold">{item.percent}%</span>
                          )}
                        </div>
                      }
                      title={
                        <>
                          <span className="font-semibold text-graphite text-body leading-snug text-safe block">
                            {item.displayTitle}
                          </span>
                          {isActive && (
                            <span className="text-[11px] text-accent font-semibold mt-1 block">
                              Текущая сделка
                            </span>
                          )}
                        </>
                      }
                      description={
                        <>
                          <span className="text-safe block">
                            {isDone
                              ? 'Сделка завершена'
                              : item.currentStepTitle
                                ? `Сейчас: ${item.currentStepTitle}`
                                : 'В процессе'}
                          </span>
                          {!isDone && (
                            <div className="mt-2">
                              <ProgressBar value={item.percent} />
                            </div>
                          )}
                        </>
                      }
                      trailing={<ChevronRight className="w-5 h-5 text-graphite-muted" />}
                    />
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};
