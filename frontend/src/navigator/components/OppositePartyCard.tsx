import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Users } from 'lucide-react';
import React, { useState } from 'react';
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
    <div className="mt-5 rounded-2xl border border-gray-100 bg-surface/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-graphite">Что происходит у другой стороны</p>
          <p className="text-xs text-graphite-muted mt-0.5 line-clamp-1">{block.title}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-graphite-muted shrink-0 transition-transform duration-200 ${
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
            <div className="px-4 pb-4 pt-0 border-t border-gray-100/80">
              <p className="text-xs font-medium text-graphite-muted mb-2">{block.title}</p>
              <ul className="text-sm text-graphite space-y-1.5">
                {block.actions.map((action) => (
                  <li key={action} className="flex gap-2">
                    <span className="text-accent shrink-0">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
