import { motion } from 'framer-motion';
import { ChevronRight, Lock } from 'lucide-react';
import React from 'react';
import type { RiskLevel } from '../types';
import { riskColorClasses, riskLabel } from '../engine/riskScoring';
import { isPageReload } from '../hooks/navigationPersistence';

const skipEnterAnimation = isPageReload();

export const fadeIn = {
  initial: skipEnterAnimation ? false : { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: skipEnterAnimation ? 0 : 0.35, ease: [0.25, 0.1, 0.25, 1] }
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
  padding?: boolean;
}> = ({ children, className = '', onClick, padding = false }) => (
  <div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    className={`${onClick ? 'card-premium-interactive cursor-pointer active:scale-[0.99]' : 'card-premium'} ${padding ? '' : '!p-0'} ${className}`}
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
    className={`btn-primary w-full ${className}`}
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
    className={`btn-secondary w-full ${className}`}
  >
    {children}
  </button>
);

export const GhostButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn-ghost w-full ${className}`}
  >
    {children}
  </button>
);

export const DangerButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  outline?: boolean;
}> = ({ children, onClick, className = '', outline }) => (
  <button
    type="button"
    onClick={onClick}
    className={
      outline
        ? `btn-secondary w-full !text-risk !border-red-100 hover:!bg-red-50/50 ${className}`
        : `btn-danger w-full ${className}`
    }
  >
    {children}
  </button>
);

export const TextButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn-ghost w-full ${className}`}
  >
    {children}
  </button>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}> = ({ children, selected, onClick, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`chip ${selected ? 'chip--active' : ''}`}
  >
    {children}
  </button>
);

export const InputField: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
> = ({ error, className = '', ...props }) => (
  <input
    {...props}
    className={`input-field ${error ? 'input-field--error' : ''} ${className}`}
  />
);

export const TextAreaField: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
> = ({ error, className = '', ...props }) => (
  <textarea
    {...props}
    className={`input-field resize-none ${error ? 'input-field--error' : ''} ${className}`}
  />
);

export const ModalCloseButton: React.FC<{ onClick: () => void; label?: string }> = ({
  onClick,
  label = 'Закрыть'
}) => (
  <button type="button" onClick={onClick} className="close-btn shrink-0" aria-label={label}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  </button>
);

export const StepStatusIcon: React.FC<{
  status: 'done' | 'current' | 'pending';
}> = ({ status }) => {
  if (status === 'done') {
    return (
      <span className="check-icon check-icon--done" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === 'current') {
    return (
      <span className="check-icon check-icon--current" aria-hidden>
        <span className="w-2 h-2 rounded-full bg-white" />
      </span>
    );
  }
  return <span className="check-icon check-icon--pending" aria-hidden />;
};

export const CheckIcon: React.FC<{ checked: boolean; className?: string }> = ({
  checked,
  className = ''
}) => (
  <span
    className={`check-icon ${checked ? 'check-icon--done' : 'check-icon--pending'} ${className}`}
    aria-hidden
  >
    {checked && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6L5 9L10 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </span>
);

export const RiskBadge: React.FC<{ level: RiskLevel; compact?: boolean }> = ({ level, compact }) => {
  const c = riskColorClasses(level);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${c.bg} ${c.text} ${c.border} ${compact ? 'text-[11px]' : 'text-xs'}`}
    >
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
    <Card onClick={onClick} className={`p-6 flex items-center gap-4 ${c.bg}`}>
      <div className={`w-11 h-11 rounded-btn flex items-center justify-center ${c.bg}`}>
        <span className="text-lg">🛡</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-desc text-graphite-muted">Уровень риска</p>
        <p className={`font-semibold text-base ${c.text}`}>{riskLabel(level)}</p>
        {factorCount > 0 && (
          <p className="text-desc text-graphite-muted mt-1">{factorCount} фактора риска</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-graphite-muted shrink-0" />
    </Card>
  );
};

export const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full h-2 bg-black/[0.04] rounded-full overflow-hidden ${className}`}>
    <motion.div
      className="h-full bg-accent rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-black/[0.04] rounded-card ${className}`} />
);

export const LockedBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-graphite-muted">
    <Lock className="w-3 h-3" />
    Премиум
  </span>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; sub?: string }> = ({ children, sub }) => (
  <div className="mb-5">
    <h2 className="text-lg font-medium text-graphite tracking-tight leading-snug">{children}</h2>
    {sub && <p className="text-desc text-graphite-muted mt-2 leading-relaxed">{sub}</p>}
  </div>
);

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center text-center py-12 px-6">
    <div className="w-14 h-14 rounded-card bg-accent-soft flex items-center justify-center text-accent mb-5">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-graphite mb-2">{title}</h3>
    <p className="text-desc text-graphite-muted leading-relaxed max-w-xs">{description}</p>
    {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
  </div>
);

export const AiPlaceholder: React.FC<{ term?: string }> = ({ term }) => (
  <button
    type="button"
    className="w-full mt-3 py-3 px-4 rounded-btn border border-dashed border-black/[0.08] text-left text-desc text-graphite-muted hover:border-accent/30 hover:bg-accent-soft/40 transition-colors"
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
