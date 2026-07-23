import React from 'react';

export const PrimaryCta: React.FC<{
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}> = ({ onClick, children = 'Получить мой план бесплатно', className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full sm:w-auto sm:min-w-[280px] px-8 py-4 rounded-2xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-all shadow-soft hover:shadow-card hover:bg-accent/95 ${className}`}
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
    {eyebrow && (
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">{eyebrow}</p>
    )}
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-graphite tracking-tight leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="text-sm sm:text-base text-graphite-muted mt-3 leading-relaxed">{subtitle}</p>
    )}
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
