import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import React, { useMemo } from 'react';
import { getTutorial } from '../data/tutorials';
import { subtaskProgress } from '../engine/buildDeal';
import { TutorialSubtaskCard } from '../components/TutorialSubtaskCard';
import { SecondaryButton } from '../components/ui';
import { useTutorialBackNavigation } from '../hooks/useTutorialBackNavigation';
import { useNavigator } from '../store/NavigatorContext';

interface TutorialDrawerProps {
  open: boolean;
  tutorialId: string | null;
  stepId: string | null;
  onClose: () => void;
}

export const TutorialDrawer: React.FC<TutorialDrawerProps> = ({
  open,
  tutorialId,
  stepId,
  onClose
}) => {
  const { progress, openLeadModal, toggleTutorialSubtask } = useNavigator();
  const tutorial = tutorialId ? getTutorial(tutorialId, progress?.scenarioId) : null;
  const resolvedStepId = stepId ?? tutorial?.stepId ?? null;

  const subtasks = tutorial?.subtasks ?? [];
  const pct = useMemo(() => {
    if (!progress || !resolvedStepId || subtasks.length === 0) return 0;
    return subtaskProgress(progress, resolvedStepId, subtasks.map((s) => s.id));
  }, [progress, resolvedStepId, subtasks]);

  const doneCount = useMemo(() => {
    if (!progress || !resolvedStepId) return 0;
    const map = progress.steps[resolvedStepId]?.subtasks ?? {};
    return subtasks.filter((s) => map[s.id]).length;
  }, [progress, resolvedStepId, subtasks]);

  const allDone = subtasks.length > 0 && doneCount === subtasks.length;
  const stepCompleted = resolvedStepId && progress?.steps[resolvedStepId]?.status === 'completed';

  const handleBack = useTutorialBackNavigation(open, onClose);

  return (
    <AnimatePresence>
      {open && tutorial && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-40 md:bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBack}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md drawer-panel flex flex-col md:rounded-l-[var(--radius-card)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="drawer-header shrink-0">
              <div className="pr-4 min-w-0">
                <h2 className="text-lg font-semibold text-graphite truncate">{tutorial.title}</h2>
                {subtasks.length > 0 && (
                  <p className="text-xs text-graphite-muted mt-0.5">
                    {allDone || stepCompleted ? (
                      <span className="text-accent font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Шаг выполнен
                      </span>
                    ) : (
                      <>Прогресс: {doneCount} из {subtasks.length} проверок</>
                    )}
                  </p>
                )}
              </div>
              <button type="button" onClick={handleBack} className="close-btn shrink-0" aria-label="Назад">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="px-4 pt-3 shrink-0">
                <div className="flex justify-between text-xs text-graphite-muted mb-1">
                  <span>{pct}%</span>
                  <span>
                    {doneCount}/{subtasks.length}
                  </span>
                </div>
                <div className="progress-track">
                  <motion.div
                    className="progress-fill"
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <section className="banner-info">
                <p className="text-base text-graphite leading-relaxed">{tutorial.summary}</p>
              </section>

              {subtasks.length > 0 ? (
                <div className="space-y-3">
                  {subtasks.map((subtask) => {
                    const completed =
                      resolvedStepId &&
                      progress?.steps[resolvedStepId]?.subtasks?.[subtask.id] === true;
                    return (
                      <TutorialSubtaskCard
                        key={subtask.id}
                        subtask={subtask}
                        completed={!!completed}
                        onToggle={() => {
                          if (resolvedStepId) {
                            toggleTutorialSubtask(resolvedStepId, subtask.id, subtasks.map((s) => s.id));
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <LegacyTutorialContent tutorial={tutorial} />
              )}

              {tutorial.links.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-graphite-muted uppercase mb-2">
                    Полезные ссылки
                  </h3>
                  {tutorial.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-base text-accent font-medium py-2 rounded-btn hover:bg-accent-soft/60 px-2 -mx-2 transition-colors"
                    >
                      {link.label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </section>
              )}

              <section className="banner-warning">
                <h3 className="text-desc font-medium mb-1">Важно</h3>
                <p>
                  Сохраняйте все документы и переписку. При сомнениях привлеките юриста до подписания
                  договоров и передачи денег.
                </p>
              </section>
            </div>

            <div className="p-4 border-t border-black/[0.06] shrink-0">
              <SecondaryButton onClick={openLeadModal}>Нужна помощь специалиста</SecondaryButton>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

function LegacyTutorialContent({
  tutorial
}: {
  tutorial: NonNullable<ReturnType<typeof getTutorial>>;
}) {
  return (
    <>
      <section>
        <h3 className="text-xs font-semibold text-graphite-muted uppercase mb-1">Что это</h3>
        <p className="text-sm text-graphite leading-relaxed">{tutorial.whatIsIt}</p>
      </section>
      <section>
        <h3 className="text-xs font-semibold text-graphite-muted uppercase mb-3">Пошаговая инструкция</h3>
        <div className="space-y-4">
          {tutorial.steps.map((st) => (
            <div key={st.order} className="flex gap-3">
              <div className="step-number">
                {st.order}
              </div>
              <div>
                <p className="font-medium text-graphite text-sm">{st.title}</p>
                <p className="text-sm text-graphite-muted mt-1">{st.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
