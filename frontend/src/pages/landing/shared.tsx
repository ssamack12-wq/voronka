import React from 'react';

export const CARD_CLASS = 'card-premium-interactive';

export const PrimaryCta: React.FC<{
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}> = ({ onClick, children = 'Создать план сделки', className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn-primary w-full sm:w-auto sm:min-w-[280px] ${className}`}
  >
    {children}
  </button>
);

export const SecondaryCta: React.FC<{
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}> = ({ onClick, children = 'Посмотреть пример', className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn-secondary w-full sm:w-auto sm:min-w-[200px] ${className}`}
  >
    {children}
  </button>
);

export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
}> = ({ eyebrow, title, subtitle }) => (
  <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
    {eyebrow && <p className="badge-eyebrow mb-4">{eyebrow}</p>}
    <h2 className="text-section-title text-graphite">{title}</h2>
    {subtitle && <p className="text-subtitle-lg mt-4 max-w-xl mx-auto">{subtitle}</p>}
  </div>
);

export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
