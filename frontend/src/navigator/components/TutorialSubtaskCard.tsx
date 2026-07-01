import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';
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
      className={`rounded-2xl border transition-colors ${
        completed ? 'border-accent/30 bg-accent-soft/20' : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          className={`w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-colors ${
            completed ? 'bg-accent border-accent text-white' : 'border-gray-200 hover:border-accent/50'
          }`}
          aria-label={completed ? 'Отметить невыполненным' : 'Отметить выполненным'}
        >
          {completed && <Check className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 min-w-0 text-left flex items-center gap-2"
        >
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${completed ? 'text-graphite-muted line-through' : 'text-graphite'}`}>
              {subtask.title}
            </p>
            <p className="text-xs text-graphite-muted mt-0.5">
              {subtask.estimatedTime} · {subtask.difficulty}
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-graphite-muted shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
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
            <div className="px-4 pb-4 space-y-4 border-t border-gray-50 pt-4">
              <Section title="Зачем это нужно" content={subtask.purpose} />

              {subtask.requiredData.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold text-graphite-muted uppercase mb-2">Что понадобится</h4>
                  <ul className="text-sm text-graphite space-y-1">
                    {subtask.requiredData.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h4 className="text-xs font-semibold text-graphite-muted uppercase mb-3">
                  Пошаговая инструкция
                </h4>
                <div className="space-y-0">
                  {subtask.steps.map((stepText, stepIndex) => {
                    const action = subtask.stepActions?.find((a) => a.afterStep === stepIndex);
                    return (
                      <div key={stepIndex}>
                        <div className="flex gap-3 py-2">
                          <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                            {stepIndex + 1}
                          </div>
                          <p className="text-sm text-graphite leading-relaxed pt-1">{stepText}</p>
                        </div>
                        {action && (
                          <a
                            href={action.url}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-10 mb-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                          >
                            {action.label}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {stepIndex < subtask.steps.length - 1 && (
                          <div className="ml-3.5 h-3 border-l-2 border-dashed border-gray-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="p-3 rounded-xl bg-green-50 border border-green-100">
                <h4 className="text-xs font-semibold text-green-800 uppercase mb-2">Нормальный результат</h4>
                <ul className="text-sm text-green-900 space-y-1">
                  {subtask.expectedResult.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </section>

              <section className="p-3 rounded-xl bg-red-50 border border-red-100">
                <h4 className="text-xs font-semibold text-risk uppercase mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Красные флаги
                </h4>
                <ul className="text-sm text-risk space-y-1">
                  {subtask.redFlags.map((item) => (
                    <li key={item}>🚩 {item}</li>
                  ))}
                </ul>
              </section>

              <section className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <h4 className="text-xs font-semibold text-amber-900 uppercase mb-2">
                  Если найден риск
                </h4>
                <ul className="text-sm text-amber-900 space-y-1">
                  {subtask.whatToDoIfRiskFound.map((item) => (
                    <li key={item}>→ {item}</li>
                  ))}
                </ul>
              </section>

              {subtask.links && subtask.links.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold text-graphite-muted uppercase mb-2">
                    Полезные ссылки
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {subtask.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-medium text-accent hover:bg-accent-soft/60 transition-colors"
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
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  completed
                    ? 'bg-gray-100 text-graphite-muted'
                    : 'bg-accent text-white hover:bg-accent/90'
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
      <h4 className="text-xs font-semibold text-graphite-muted uppercase mb-1">{title}</h4>
      <p className="text-sm text-graphite leading-relaxed">{content}</p>
    </section>
  );
}
