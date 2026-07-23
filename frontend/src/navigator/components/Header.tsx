import { ArrowLeft, Bookmark, Menu } from 'lucide-react';
import React from 'react';

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
  <header className="flex items-center justify-between py-5 px-4 shrink-0">
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
        <div className="w-9 h-9 rounded-btn bg-accent-soft flex items-center justify-center shrink-0">
          <span className="text-accent text-lg">⌂</span>
        </div>
      ) : (
        <div className="w-9" />
      )}
      <div className="min-w-0">
        {subtitle && <p className="text-desc text-graphite-muted truncate">{subtitle}</p>}
        {title && <h1 className="text-base font-semibold text-graphite truncate">{title}</h1>}
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
