import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ChevronDown, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  emergencyRiskLabel,
  searchEmergencyScenarios,
  type EmergencyRiskLevel,
  type EmergencyScenario
} from '../data/emergencyScenarios';

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
    <motion.div
      layout
      className="card-premium overflow-hidden !p-0"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 text-left flex gap-3 items-start"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-graphite text-sm leading-snug">{scenario.title}</p>
          <p className="text-xs text-graphite-muted mt-1 line-clamp-2">{scenario.problem}</p>
          <span
            className={`inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${riskBadgeClass[scenario.riskLevel]}`}
          >
            {emergencyRiskLabel(scenario.riskLevel)}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-graphite-muted shrink-0 transition-transform duration-200 ${
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
            <div className="px-4 pb-4 space-y-4 pt-3">
              <section>
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-1">Проблема</p>
                <p className="text-sm text-graphite leading-relaxed">{scenario.problem}</p>
              </section>
              <section>
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-2">Что делать прямо сейчас</p>
                <ol className="text-sm text-graphite space-y-1.5 list-decimal list-inside">
                  {scenario.actionsNow.map((a) => (
                    <li key={a} className="leading-relaxed">
                      {a}
                    </li>
                  ))}
                </ol>
              </section>
              <section>
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-2">Чего НЕ делать</p>
                <ul className="text-sm text-graphite space-y-1">
                  {scenario.dontDo.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className="text-risk shrink-0">•</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-1">Уровень риска</p>
                <span
                  className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${riskBadgeClass[scenario.riskLevel]}`}
                >
                  {emergencyRiskLabel(scenario.riskLevel)}
                </span>
              </section>
              <section>
                <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-1">Когда обращаться к специалисту</p>
                <p className="text-sm text-graphite leading-relaxed">{scenario.specialistWhen}</p>
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
            className="fixed inset-0 z-[61] flex flex-col max-w-lg mx-auto bg-white"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-4 pt-4 pb-3 safe-top shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-medium text-graphite">Что делать если…</h2>
                </div>
                <button type="button" onClick={onClose} className="close-btn" aria-label="Закрыть">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
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

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-8">
              {results.length === 0 ? (
                <p className="text-sm text-graphite-muted text-center py-8">
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
