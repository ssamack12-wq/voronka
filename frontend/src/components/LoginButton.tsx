import React from 'react';
import { LogIn, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/store';

interface LoginButtonProps {
  redirectPath?: string;
  className?: string;
  variant?: 'primary' | 'ghost';
  showProfileWhenAuthed?: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  redirectPath = '/app',
  className = '',
  variant = 'ghost',
  showProfileWhenAuthed = false
}) => {
  const { user, openAuthModal } = useAuthStore();
  const navigate = useNavigate();

  const base =
    variant === 'primary'
      ? 'min-h-btn-h px-6 rounded-btn border border-black/[0.06] text-base font-medium text-graphite flex items-center justify-center gap-2 hover:scale-[1.02] hover:bg-surface transition-all'
      : 'text-base font-medium text-accent flex items-center gap-1.5 hover:opacity-80 transition-opacity';

  if (user && showProfileWhenAuthed) {
    return (
      <button
        type="button"
        className={`${base} ${className}`.trim()}
        onClick={() => navigate('/app/profile')}
      >
        <User className="w-4 h-4" />
        Профиль
      </button>
    );
  }

  if (user) return null;

  return (
    <button
      type="button"
      className={`${base} ${className}`.trim()}
      onClick={() => openAuthModal(redirectPath)}
    >
      <LogIn className="w-4 h-4" />
      Войти
    </button>
  );
};
