import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Users } from 'lucide-react';
import React, { useState } from 'react';
import { CheckedListRow } from './ui';
import { getOppositePartyBlock } from '../data/oppositePartyActions';
import type { ScenarioCategory } from '../types';

interface OppositePartyCardProps {
  stepId: string;
  phase: string;
  category: ScenarioCategory;
}

export const OppositePartyCard: React.FC<OppositePartyCardProps> = ({
  stepId,
  phase,
  category
}) => {
  const [open, setOpen] = useState(false);
  const block = getOppositePartyBlock(stepId, phase, category);

  return (
    <div className="mt-5 card-premium overflow-hidden !p-0 min-w-0 max-w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full feature-row card-inner text-left hover:bg-surface/50 transition-colors min-w-0"
        aria-expanded={open}
      >
        <div className="feature-row__icon">
          <div className="w-11 h-11 rounded-btn bg-accent-soft flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
        </div>
        <div className="feature-row__content text-safe">
          <p className="feature-row__title font-medium">Что происходит у другой стороны</p>
          <p className="feature-row__description">{block.title}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-graphite-muted feature-row__trailing transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="card-inner pt-0">
              <p className="text-desc font-medium text-graphite-muted mb-3 text-safe">{block.title}</p>
              <ul className="card-list">
                {block.actions.map((action) => (
                  <CheckedListRow key={action} title={action} />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
