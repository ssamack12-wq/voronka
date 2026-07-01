import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store';
import { Card } from './ui';

interface GuestBannerProps {
  message?: string;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({
  message = 'Вы просматриваете сценарий без входа. Прогресс не сохранится между устройствами.'
}) => {
  const { user, openAuthModal } = useAuthStore();
  const navigate = useNavigate();

  if (user) return null;

  return (
    <Card className="p-4 bg-accent-soft/40 border-accent/15 mb-4">
      <p className="text-sm text-graphite leading-relaxed">{message}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          onClick={() => openAuthModal('/app/deal')}
          className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold"
        >
          Войти и сохранить прогресс
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/onboarding')}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-graphite"
        >
          Новый квиз
        </button>
      </div>
    </Card>
  );
};
