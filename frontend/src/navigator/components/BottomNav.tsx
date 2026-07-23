import { Calendar, FolderOpen, Home, User } from 'lucide-react';
import React from 'react';
import type { NavigatorTab } from '../types';

const tabs: { id: NavigatorTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'deal', label: 'Сделка', icon: Home },
  { id: 'deals', label: 'Мои', icon: FolderOpen },
  { id: 'calendar', label: 'Календарь', icon: Calendar },
  { id: 'profile', label: 'Профиль', icon: User }
];

interface BottomNavProps {
  active: NavigatorTab;
  onChange: (tab: NavigatorTab) => void;
  hidden?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange, hidden }) => {
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl safe-bottom">
      <div className="flex items-stretch justify-around px-4 pt-3 pb-2 max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1.5 min-w-[72px] py-2 rounded-btn transition-all duration-200 ${
                isActive ? 'text-accent' : 'text-graphite-muted hover:text-graphite'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px] scale-105' : ''}`} />
              <span className="text-[11px] font-medium tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
