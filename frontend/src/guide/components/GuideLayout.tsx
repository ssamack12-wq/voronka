import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { LoginButton } from '../../components/LoginButton';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface GuideLayoutProps {
  children: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
  stickyCta?: React.ReactNode;
}

export const GuideLayout: React.FC<GuideLayoutProps> = ({ children, breadcrumbs, stickyCta }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex justify-center w-full">
      <div className="w-full max-w-guide px-4 sm:px-6 py-6 sm:py-10 flex flex-col min-h-screen pb-24 sm:pb-10">
        <header className="flex items-center justify-between mb-8 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-base font-medium text-graphite hover:text-accent transition-colors"
          >
            <span className="w-8 h-8 rounded-btn bg-accent-soft flex items-center justify-center text-accent">
              ⌂
            </span>
            <span className="hidden sm:inline">Навигатор сделки</span>
          </button>
          <LoginButton redirectPath="/app/onboarding" showProfileWhenAuthed className="!text-base" />
        </header>

        <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-1 text-desc text-graphite-muted mb-8">
          <Link to="/" className="hover:text-accent flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Главная
          </Link>
          {breadcrumbs.map((item) => (
            <React.Fragment key={item.label}>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              {item.href ? (
                <Link to={item.href} className="hover:text-accent">
                  {item.label}
                </Link>
              ) : (
                <span className="text-graphite font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 pt-8 text-desc text-graphite-muted space-y-3">
          <p>
            <Link to="/guide" className="text-accent font-medium hover:underline">
              Все руководства
            </Link>
            {' · '}
            <Link to="/app/onboarding" className="text-accent font-medium hover:underline">
              Определить мой сценарий
            </Link>
            {' · '}
            <Link to="/" className="text-accent font-medium hover:underline">
              Главная
            </Link>
          </p>
          <p>© {new Date().getFullYear()} Навигатор сделки. Информация носит справочный характер.</p>
        </footer>
      </div>

      {stickyCta && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/90 backdrop-blur-xl safe-bottom px-4 py-3">
          {stickyCta}
        </div>
      )}
    </div>
  );
};
