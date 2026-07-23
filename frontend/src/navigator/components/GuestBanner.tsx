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
    <Card className="p-5 bg-accent-soft/40 mb-4">
      <p className="text-base text-graphite leading-relaxed">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <PrimaryButton className="!min-h-[44px] text-sm" onClick={() => openAuthModal('/app/deal')}>
          Войти и сохранить прогресс
        </PrimaryButton>
        <SecondaryButton className="!min-h-[44px] text-sm" onClick={() => navigate('/app/onboarding')}>
          Новый квиз
        </SecondaryButton>
      </div>
    </Card>
  );
};
