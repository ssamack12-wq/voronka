import { motion } from 'framer-motion';
import { ChevronRight, Lock } from 'lucide-react';
import React from 'react';
import type { RiskLevel } from '../types';
import { riskColorClasses, riskLabel } from '../engine/riskScoring';
import { isPageReload } from '../hooks/navigationPersistence';

const skipEnterAnimation = isPageReload();

export const fadeIn = {
  initial: skipEnterAnimation ? false : { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: skipEnterAnimation ? 0 : 0.22, ease: [0.25, 0.1, 0.25, 1] }
};

export const PageShell = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
  }
>(({ children, className = '', noPadding }, ref) => (
  <motion.div
    ref={ref}
    {...fadeIn}
    className={`flex flex-col flex-1 min-h-0 ${noPadding ? '' : 'px-4'} ${className}`}
  >
    {children}
  </motion.div>
));
PageShell.displayName = 'PageShell';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => (
  <div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    className={`rounded-2xl border border-gray-100 bg-white shadow-soft ${onClick ? 'active:scale-[0.99] cursor-pointer transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

export const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}> = ({ children, onClick, disabled, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3.5 rounded-2xl bg-accent text-white font-semibold text-[15px] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-soft ${className}`}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full py-3.5 rounded-2xl bg-accent-soft text-accent font-semibold text-[15px] active:scale-[0.98] transition-transform ${className}`}
  >
    {children}
  </button>
);

export const GhostButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-3 rounded-2xl border border-gray-200 text-graphite text-sm font-medium active:scale-[0.98] transition-transform"
  >
    {children}
  </button>
);

export const RiskBadge: React.FC<{ level: RiskLevel; compact?: boolean }> = ({ level, compact }) => {
  const c = riskColorClasses(level);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${c.bg} ${c.text} ${c.border} ${compact ? 'text-[11px]' : 'text-xs'}`}>
      {riskLabel(level)}
    </span>
  );
};

export const RiskCard: React.FC<{
  level: RiskLevel;
  factorCount: number;
  onClick?: () => void;
}> = ({ level, factorCount, onClick }) => {
  const c = riskColorClasses(level);
  return (
    <Card onClick={onClick} className={`p-4 flex items-center gap-3 ${c.bg} border ${c.border}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
        <span className="text-lg">🛡</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-graphite-muted">Уровень риска</p>
        <p className={`font-semibold ${c.text}`}>{riskLabel(level)}</p>
        {factorCount > 0 && (
          <p className="text-xs text-graphite-muted mt-0.5">{factorCount} фактора риска</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-graphite-muted shrink-0" />
    </Card>
  );
};

export const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
    <motion.div
      className="h-full bg-accent rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />
);

export const LockedBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-graphite-muted">
    <Lock className="w-3 h-3" />
    Премиум
  </span>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; sub?: string }> = ({ children, sub }) => (
  <div className="mb-3">
    <h2 className="text-lg font-semibold text-graphite tracking-tight">{children}</h2>
    {sub && <p className="text-sm text-graphite-muted mt-0.5">{sub}</p>}
  </div>
);

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center text-center py-12 px-6">
    <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center text-accent mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-graphite mb-2">{title}</h3>
    <p className="text-sm text-graphite-muted leading-relaxed max-w-xs">{description}</p>
    {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
  </div>
);

export const AiPlaceholder: React.FC<{ term?: string }> = ({ term }) => (
  <button
    type="button"
    className="w-full mt-3 py-2.5 px-3 rounded-xl border border-dashed border-gray-200 text-left text-xs text-graphite-muted hover:border-accent/40 hover:bg-accent-soft/50 transition-colors"
  >
    {term ? (
      <>
        Не понимаете, что такое <span className="font-medium text-graphite">{term}</span>?{' '}
        <span className="text-accent font-medium">Спросить AI →</span>
      </>
    ) : (
      <>
        Нужна подсказка? <span className="text-accent font-medium">Спросить AI →</span>
      </>
    )}
  </button>
);
