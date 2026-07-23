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
    <div className="mt-5 card-premium overflow-hidden !p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-surface/50 transition-colors"
        aria-expanded={open}
      >
        <div className="w-11 h-11 rounded-btn bg-accent-soft flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-graphite">Что происходит у другой стороны</p>
          <p className="text-desc text-graphite-muted mt-1 line-clamp-1">{block.title}</p>
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
            <div className="px-6 pb-6 pt-0">
              <p className="text-desc font-medium text-graphite-muted mb-3">{block.title}</p>
              <ul className="space-y-2.5">
                {block.actions.map((action) => (
                  <li key={action} className="checklist-card flex gap-3 !py-3 !px-4">
                    <span className="check-icon check-icon--done shrink-0 !w-6 !h-6" aria-hidden>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-base text-graphite leading-relaxed">{action}</span>
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
