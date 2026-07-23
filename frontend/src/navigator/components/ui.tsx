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
    className={`flex flex-col flex-1 min-h-0 min-w-0 max-w-full w-full ${noPadding ? '' : 'page-content'} ${className}`}
  >
    {children}
  </motion.div>
));
PageShell.displayName = 'PageShell';

export const PageContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  gap?: 'default' | 'sm';
}> = ({ children, className = '', gap = 'default' }) => (
  <div
    className={`page-content page-stack ${gap === 'sm' ? 'page-stack--sm' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** @deprecated Use size="flush" instead */
  flush?: boolean;
  /** default: token padding (20/28/32px). compact: dense padding. flush: no padding */
  size?: 'default' | 'compact' | 'flush';
  tone?: 'default' | 'warning' | 'success' | 'danger' | 'accent';
}> = ({ children, className = '', onClick, flush = false, size, tone = 'default' }) => {
  const resolvedSize = size ?? (flush ? 'flush' : 'default');
  const toneClass =
    tone === 'warning'
      ? 'card-premium--warning'
      : tone === 'success'
        ? 'card-premium--success'
        : tone === 'danger'
          ? 'card-premium--danger'
          : tone === 'accent'
            ? 'card-premium--accent'
            : '';
  const sizeClass =
    resolvedSize === 'flush'
      ? '!p-0'
      : resolvedSize === 'compact'
        ? 'card-premium--dense'
        : '';

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`${onClick ? 'card-premium-interactive cursor-pointer active:scale-[0.99]' : 'card-premium'} ${toneClass} ${sizeClass} min-w-0 max-w-full ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <div className={`card-header min-w-0 max-w-full ${className}`}>{children}</div>;

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <div className={`card-content text-safe ${className}`}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <div className={`card-footer min-w-0 max-w-full ${className}`}>{children}</div>;

export const ListRow: React.FC<{
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  as?: 'div' | 'li';
}> = ({ icon, title, description, trailing, className = '', as: Tag = 'div' }) => (
  <Tag className={`list-row ${className}`}>
    <div className="list-row__icon">{icon}</div>
    <div className="list-row__content text-safe">
      <div className="feature-row__title text-safe">{title}</div>
      {description != null && (
        <div className="feature-row__description text-safe">{description}</div>
      )}
    </div>
    {trailing && <div className="feature-row__trailing">{trailing}</div>}
  </Tag>
);

export const CheckedListRow: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  className?: string;
  as?: 'div' | 'li';
}> = ({ title, description, checked = true, className = '', as: Tag = 'li' }) => (
  <Tag className={`list-row list-row--nested ${className}`}>
    <div className="list-row__icon">
      <CheckIcon checked={checked} className="mt-0.5" />
    </div>
    <div className="list-row__content text-safe">
      <div className="feature-row__title text-safe">{title}</div>
      {description != null && (
        <div className="feature-row__description text-safe">{description}</div>
      )}
    </div>
  </Tag>
);

export const StatFeatureRow: React.FC<{
  icon?: React.ReactNode;
  text: React.ReactNode;
  checked?: boolean;
  locked?: boolean;
  className?: string;
  as?: 'div' | 'li';
}> = ({ icon, text, checked = true, locked, className = '', as: Tag = 'li' }) => (
  <Tag className={`feature-row ${locked ? 'opacity-70' : ''} ${className}`}>
    <div className="feature-row__icon">
      {locked ? (
        <Lock className="w-4 h-4 text-graphite-muted mt-0.5" aria-hidden />
      ) : icon ? (
        icon
      ) : (
        <CheckIcon checked={checked} />
      )}
    </div>
    <div className="feature-row__content text-safe">
      <div className="feature-row__title text-safe">{text}</div>
    </div>
  </Tag>
);

export const FeatureRow: React.FC<{
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  as?: 'div' | 'li';
}> = ({ icon, title, description, trailing, className = '', as: Tag = 'div' }) => (
  <Tag className={`feature-row ${className}`}>
    <div className="feature-row__icon">{icon}</div>
    <div className="feature-row__content text-safe">
      <div className="feature-row__title text-safe">{title}</div>
      {description != null && (
        <div className="feature-row__description text-safe">{description}</div>
      )}
    </div>
    {trailing && <div className="feature-row__trailing">{trailing}</div>}
  </Tag>
);

export const ChecklistRow: React.FC<{
  icon?: React.ReactNode;
  checked?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  compact?: boolean;
  /** card: standalone card (default). inline: row inside a parent card/list */
  variant?: 'card' | 'inline';
  as?: 'div' | 'li';
}> = ({
  icon,
  checked = true,
  title,
  description,
  trailing,
  className = '',
  compact = false,
  variant = 'card',
  as: Tag = 'div'
}) => {
  const rowClass =
    variant === 'inline'
      ? 'checklist-row'
      : `checklist-card feature-row ${compact ? 'checklist-card--compact' : ''}`;

  return (
    <Tag className={`${rowClass} ${className}`}>
      <div className="feature-row__icon">
        {icon ?? <CheckIcon checked={checked} className="mt-0.5" />}
      </div>
      <div className="feature-row__content text-safe">
        <div className="feature-row__title text-safe">{title}</div>
        {description != null && (
          <div className="feature-row__description text-safe">{description}</div>
        )}
      </div>
      {trailing && <div className="feature-row__trailing">{trailing}</div>}
    </Tag>
  );
};

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
    className={`btn-primary w-full text-safe ${className}`}
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
    className={`btn-secondary w-full text-safe ${className}`}
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
    className={`btn-ghost w-full text-safe ${className}`}
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
        ? `btn-secondary w-full !text-risk !border-red-100 hover:!bg-red-50/50 text-safe ${className}`
        : `btn-danger w-full text-safe ${className}`
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
    className={`btn-ghost w-full text-safe ${className}`}
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
    className={`chip text-safe ${selected ? 'chip--active' : ''}`}
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
    <Card onClick={onClick} className={c.bg}>
      <FeatureRow
        icon={
          <IconBox size="md" className={c.bg}>
            <span className="text-lg">🛡</span>
          </IconBox>
        }
        title={
          <>
            <span className="text-desc text-graphite-muted block">Уровень риска</span>
            <span className={`font-semibold text-body ${c.text}`}>{riskLabel(level)}</span>
          </>
        }
        description={
          factorCount > 0 ? (
            <span className="text-desc text-graphite-muted">{factorCount} фактора риска</span>
          ) : undefined
        }
        trailing={<ChevronRight className="w-5 h-5 text-graphite-muted" />}
      />
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

export const PageTitle: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}> = ({ eyebrow, title, description, className = '' }) => (
  <div className={`min-w-0 max-w-full ${className}`}>
    {eyebrow && <p className="text-desc text-graphite-muted mb-1 text-safe">{eyebrow}</p>}
    <h2 className="text-h2 text-graphite text-safe">{title}</h2>
    {description && (
      <p className="text-desc text-graphite-muted mt-2 text-safe leading-relaxed">{description}</p>
    )}
  </div>
);

export const SectionTitle: React.FC<{
  children: React.ReactNode;
  sub?: string;
  className?: string;
}> = ({ children, sub, className = '' }) => (
  <div className={`min-w-0 max-w-full ${className}`}>
    <h2 className="text-h2 text-graphite text-safe">{children}</h2>
    {sub && <p className="text-desc text-graphite-muted mt-1 text-safe leading-relaxed">{sub}</p>}
  </div>
);

export const IconBox: React.FC<{
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, size = 'md', className = '' }) => (
  <div className={`icon-box icon-box--${size} ${className}`}>{children}</div>
);

export const StepRow: React.FC<{
  status: 'done' | 'current' | 'pending';
  title: React.ReactNode;
  description?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ status, title, description, onClick, className = '' }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`step-card feature-row w-full text-left items-start ${
        status === 'current' ? 'step-card--current' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="feature-row__icon">
        <StepStatusIcon status={status} />
      </div>
      <div className="feature-row__content text-safe">
        <div
          className={`feature-row__title text-safe ${
            status === 'current'
              ? 'text-accent'
              : status === 'done'
                ? 'text-graphite-muted line-through'
                : ''
          }`}
        >
          {title}
        </div>
        {description != null && (
          <div className="feature-row__description text-safe">{description}</div>
        )}
      </div>
    </Tag>
  );
};

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center text-center py-12 card-inner">
    <div className="w-14 h-14 rounded-card bg-accent-soft flex items-center justify-center text-accent mb-5">
      {icon}
    </div>
    <h3 className="text-h2 text-graphite mb-2 text-safe">{title}</h3>
    <p className="text-desc text-graphite-muted max-w-xs text-safe">{description}</p>
    {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
  </div>
);

export const AiPlaceholder: React.FC<{ term?: string }> = ({ term }) => (
  <button
    type="button"
    className="w-full mt-3 py-3 px-4 rounded-btn border border-dashed border-black/[0.08] text-left text-desc text-graphite-muted hover:border-accent/30 hover:bg-accent-soft/40 transition-colors text-safe"
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
