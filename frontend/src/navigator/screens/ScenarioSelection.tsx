import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronRight, KeyRound } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../../hooks/useAnalytics';
import { SCENARIOS_BY_CATEGORY } from '../data/scenarios';
import { Header } from '../components/Header';
import { Card, FeatureRow, IconBox, PageShell, RiskBadge, SectionTitle } from '../components/ui';
import { useNavigator } from '../store/NavigatorContext';
import type { ScenarioDefinition } from '../types';

export const ScenarioSelection: React.FC = () => {
  const { startScenario, setDrawerOpen } = useNavigator();
  const navigate = useNavigate();
  const [category, setCategory] = useState<'buy' | 'sell'>('buy');

  const list = SCENARIOS_BY_CATEGORY[category];

  return (
    <PageShell className="pb-4" noPadding>
      <Header
        logo
        showMenu
        onMenu={() => setDrawerOpen(true)}
        onBack={() => navigate('/')}
        title="Навигатор сделки"
        subtitle="Расширенный выбор"
      />
      <div className="page-content flex flex-col flex-1 min-h-0 overflow-hidden">
        <SectionTitle sub="Обычно сценарий определяется автоматически в квизе">
          Выбор сценария вручную
        </SectionTitle>
        <button
          type="button"
          onClick={() => navigate('/app/onboarding')}
          className="text-small text-accent font-semibold mb-3 text-left text-safe"
        >
          ← Вернуться к квизу
        </button>

        <div className="segment-control mb-4">
          {(['buy', 'sell'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`segment-control__item ${category === cat ? 'segment-control__item--active' : ''}`}
            >
              {cat === 'buy' ? 'Покупка' : 'Продажа'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2 pb-4">
          <AnimatePresence mode="popLayout">
            {list.map((scenario, i) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                index={i}
                onSelect={() => {
                  trackEvent('selected_scenario', { scenarioId: scenario.id });
                  startScenario(scenario.id);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  );
};

const ScenarioCard: React.FC<{
  scenario: ScenarioDefinition;
  index: number;
  onSelect: () => void;
}> = ({ scenario, index, onSelect }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.02, duration: 0.2 }}
  >
    <Card onClick={onSelect}>
      <FeatureRow
        icon={
          <IconBox size="md">
            {scenario.category === 'buy' ? (
              <KeyRound className="w-5 h-5 text-accent" />
            ) : (
              <Building2 className="w-5 h-5 text-accent" />
            )}
          </IconBox>
        }
        title={scenario.title}
        description={
          <>
            <span className="block">{scenario.description}</span>
            <span className="flex flex-wrap items-center gap-2 mt-2">
              <RiskBadge level={scenario.baseRisk} compact />
              <span className="text-desc text-graphite-muted">
                Сложность {scenario.complexity}/10 · {scenario.estimatedDuration}
              </span>
            </span>
          </>
        }
        trailing={<ChevronRight className="w-5 h-5 text-graphite-muted" />}
      />
    </Card>
  </motion.div>
);
