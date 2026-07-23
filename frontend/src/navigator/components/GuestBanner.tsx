import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store';
import { Card, PrimaryButton, SecondaryButton } from './ui';

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
    <Card tone="accent" className="mb-4">
      <p className="text-body text-graphite leading-relaxed text-safe">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4 min-w-0">
        <PrimaryButton className="!min-h-[44px] text-sm flex-1 min-w-0" onClick={() => openAuthModal('/app/deal')}>
          Войти и сохранить прогресс
        </PrimaryButton>
        <SecondaryButton className="!min-h-[44px] text-sm flex-1 min-w-0" onClick={() => navigate('/app/onboarding')}>
          Новый квиз
        </SecondaryButton>
      </div>
    </Card>
  );
};
