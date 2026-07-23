import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ChevronDown, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  emergencyRiskLabel,
  searchEmergencyScenarios,
  type EmergencyRiskLevel,
  type EmergencyScenario
} from '../data/emergencyScenarios';
import { ModalCloseButton } from './ui';

interface EmergencyScenariosPanelProps {
  open: boolean;
  onClose: () => void;
}

const riskBadgeClass: Record<EmergencyRiskLevel, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-900',
  high: 'bg-red-100 text-red-800'
};

const ScenarioCard: React.FC<{ scenario: EmergencyScenario }> = ({ scenario }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout className="card-premium overflow-hidden !p-0 min-w-0 max-w-full">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full card-inner text-left feature-row hover:bg-surface/50 transition-colors min-w-0"
        aria-expanded={expanded}
      >
        <div className="feature-row__content text-safe">
          <p className="feature-row__title font-semibold leading-snug">{scenario.title}</p>
          <p className="feature-row__description">{scenario.problem}</p>
          <span
            className={`inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${riskBadgeClass[scenario.riskLevel]}`}
          >
            {emergencyRiskLabel(scenario.riskLevel)}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-graphite-muted feature-row__trailing transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="card-inner pt-0 page-stack page-stack--sm">
              <section className="min-w-0">
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-1">Проблема</p>
                <p className="text-body text-graphite leading-relaxed text-safe">{scenario.problem}</p>
              </section>
              <section className="min-w-0">
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-2">Что делать прямо сейчас</p>
                <ol className="text-body text-graphite space-y-1.5 list-decimal list-inside text-safe">
                  {scenario.actionsNow.map((a) => (
                    <li key={a} className="leading-relaxed">
                      {a}
                    </li>
                  ))}
                </ol>
              </section>
              <section className="min-w-0">
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-2">Чего НЕ делать</p>
                <ul className="text-body text-graphite space-y-1">
                  {scenario.dontDo.map((d) => (
                    <li key={d} className="feature-row !gap-2">
                      <span className="text-risk shrink-0">•</span>
                      <span className="feature-row__content text-safe">{d}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="min-w-0">
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-1">Уровень риска</p>
                <span
                  className={`inline-block text-small font-semibold px-2.5 py-1 rounded-full ${riskBadgeClass[scenario.riskLevel]}`}
                >
                  {emergencyRiskLabel(scenario.riskLevel)}
                </span>
              </section>
              <section className="min-w-0">
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-1">
                  Когда обращаться к специалисту
                </p>
                <p className="text-body text-graphite leading-relaxed text-safe">{scenario.specialistWhen}</p>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const EmergencyScenariosPanel: React.FC<EmergencyScenariosPanelProps> = ({
  open,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchEmergencyScenarios(query), [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[61] flex flex-col max-w-lg mx-auto bg-white min-w-0"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md page-content pt-4 pb-3 safe-top shadow-soft min-w-0">
              <div className="flex items-center justify-between gap-3 mb-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <AlertCircle className="w-5 h-5 text-accent shrink-0" />
                  <h2 className="text-h2 text-graphite text-safe leading-snug">Что делать если…</h2>
                </div>
                <ModalCloseButton onClick={onClose} />
              </div>
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по ситуациям…"
                  className="input-field !pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden page-content py-4 page-stack page-stack--sm pb-8">
              {results.length === 0 ? (
                <p className="text-body text-graphite-muted text-center py-8 text-safe">
                  Ничего не найдено. Попробуйте другой запрос.
                </p>
              ) : (
                results.map((s) => <ScenarioCard key={s.id} scenario={s} />)
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
