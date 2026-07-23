import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';
import { CheckIcon } from './ui';
import type { TutorialSubtask } from '../types';

interface TutorialSubtaskCardProps {
  subtask: TutorialSubtask;
  completed: boolean;
  onToggle: () => void;
}

export const TutorialSubtaskCard: React.FC<TutorialSubtaskCardProps> = ({
  subtask,
  completed,
  onToggle
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`card-premium overflow-hidden transition-colors ${
        completed ? 'bg-accent-soft/30' : ''
      }`}
    >
      <div className="feature-row card-inner !py-5">
        <div className="feature-row__icon">
          <button
            type="button"
            onClick={onToggle}
            aria-label={completed ? 'Отметить невыполненным' : 'Отметить выполненным'}
          >
            <CheckIcon checked={completed} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="feature-row__content text-left min-w-0 flex items-start gap-2"
        >
          <div className="flex-1 min-w-0">
            <p
              className={`feature-row__title leading-relaxed text-safe ${completed ? 'text-graphite-muted line-through' : ''}`}
            >
              {subtask.title}
            </p>
            <p className="feature-row__description text-safe">
              {subtask.estimatedTime} · {subtask.difficulty}
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-graphite-muted feature-row__trailing transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card-inner pt-0 space-y-5">
              <Section title="Зачем это нужно" content={subtask.purpose} />

              {subtask.requiredData.length > 0 && (
                <section>
                  <h4 className="text-desc font-medium text-graphite-muted uppercase tracking-wide mb-3">
                    Что понадобится
                  </h4>
                  <ul className="text-base text-graphite space-y-2 leading-relaxed">
                    {subtask.requiredData.map((item) => (
                      <li key={item} className="feature-row !gap-2">
                        <span className="text-accent shrink-0">•</span>
                        <span className="feature-row__content text-safe">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h4 className="text-desc font-medium text-graphite-muted uppercase tracking-wide mb-4">
                  Пошаговая инструкция
                </h4>
                <div className="space-y-0">
                  {subtask.steps.map((stepText, stepIndex) => {
                    const action = subtask.stepActions?.find((a) => a.afterStep === stepIndex);
                    return (
                      <div key={stepIndex}>
                        <div className="feature-row py-3">
                          <div className="feature-row__icon">
                            <div className="step-number">
                              {stepIndex + 1}
                            </div>
                          </div>
                          <p className="feature-row__content text-base text-graphite leading-relaxed pt-0.5 text-safe">{stepText}</p>
                        </div>
                        {action && (
                          <a
                            href={action.url}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-12 mb-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-btn bg-accent text-white text-desc font-medium hover:scale-[1.02] transition-transform"
                          >
                            {action.label}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {stepIndex < subtask.steps.length - 1 && (
                          <div className="ml-4 h-4 border-l-2 border-dashed border-black/[0.06]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="card-premium bg-green-50">
                <h4 className="text-desc font-medium text-green-800 uppercase tracking-wide mb-3">
                  Нормальный результат
                </h4>
                <ul className="text-base text-green-900 space-y-2 leading-relaxed">
                  {subtask.expectedResult.map((item) => (
                    <li key={item} className="feature-row !gap-2">
                      <Check className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                      <span className="feature-row__content text-safe">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="card-premium bg-red-50">
                <h4 className="text-desc font-medium text-risk uppercase mb-3 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-safe">Красные флаги</span>
                </h4>
                <ul className="text-base text-risk space-y-2 leading-relaxed">
                  {subtask.redFlags.map((item) => (
                    <li key={item} className="text-safe">🚩 {item}</li>
                  ))}
                </ul>
              </section>

              <section className="card-premium bg-amber-50">
                <h4 className="text-desc font-medium text-amber-900 uppercase mb-3">
                  Если найден риск
                </h4>
                <ul className="text-base text-amber-900 space-y-2 leading-relaxed">
                  {subtask.whatToDoIfRiskFound.map((item) => (
                    <li key={item} className="text-safe">→ {item}</li>
                  ))}
                </ul>
              </section>

              {subtask.links && subtask.links.length > 0 && (
                <section>
                  <h4 className="text-desc font-medium text-graphite-muted uppercase mb-3">
                    Полезные ссылки
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {subtask.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-surface text-desc font-medium text-accent hover:bg-accent-soft/60 transition-colors"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <button
                type="button"
                onClick={onToggle}
                className={`w-full min-h-btn-h rounded-btn text-base font-medium transition-all ${
                  completed
                    ? 'bg-surface text-graphite-muted'
                    : 'bg-accent text-white hover:scale-[1.02] shadow-btn'
                }`}
              >
                {completed ? 'Выполнено ✓' : 'Отметить выполненным'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function Section({ title, content }: { title: string; content: string }) {
  return (
    <section>
      <h4 className="text-desc font-medium text-graphite-muted uppercase tracking-wide mb-2">{title}</h4>
      <p className="text-base text-graphite leading-relaxed text-safe">{content}</p>
    </section>
  );
}
