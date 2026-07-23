import { ArrowLeft, Bookmark, Menu } from 'lucide-react';
import React from 'react';
import { AppLogo } from '../../components/AppLogo';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  showBookmark?: boolean;
  bookmarked?: boolean;
  onBookmark?: () => void;
  logo?: boolean;
  rightSlot?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  showMenu,
  onMenu,
  showBookmark,
  bookmarked,
  onBookmark,
  logo,
  rightSlot
}) => (
  <header className="flex items-center justify-between py-5 page-content shrink-0 min-w-0 max-w-full">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 -ml-1 flex items-center justify-center rounded-btn hover:bg-black/[0.03] active:scale-95 transition-transform shrink-0"
          aria-label="Назад"
        >
          <ArrowLeft className="w-5 h-5 text-graphite" />
        </button>
      ) : logo ? (
        <AppLogo />
      ) : (
        <div className="w-9" />
      )}
      <div className="min-w-0 flex-1 max-w-full">
        {subtitle && <p className="text-desc text-graphite-muted text-safe">{subtitle}</p>}
        {title && (
          <h1 className="text-body font-semibold text-graphite text-safe leading-snug break-words">{title}</h1>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      {rightSlot}
      {showBookmark && (
        <button
          type="button"
          onClick={onBookmark}
          className="w-10 h-10 flex items-center justify-center rounded-btn hover:bg-black/[0.03] active:scale-95 transition-transform"
          aria-label="Закладка"
        >
          <Bookmark
            className={`w-5 h-5 ${bookmarked ? 'text-accent fill-accent/20' : 'text-graphite-muted'}`}
          />
        </button>
      )}
      {showMenu && (
        <button
          type="button"
          onClick={onMenu}
          className="w-10 h-10 flex items-center justify-center rounded-btn hover:bg-black/[0.03] active:scale-95 transition-transform"
          aria-label="Меню"
        >
          <Menu className="w-5 h-5 text-graphite" />
        </button>
      )}
    </div>
  </header>
);
