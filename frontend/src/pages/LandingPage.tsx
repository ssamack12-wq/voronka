import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginButton } from '../components/LoginButton';
import { GUIDE_META } from '../guide/index';
import { ArticlesSection } from './landing/ArticlesSection';
import { BenefitsSection } from './landing/BenefitsSection';
import { DealTypesSection } from './landing/DealTypesSection';
import { FinalCtaSection } from './landing/FinalCtaSection';
import { HeroSection } from './landing/HeroSection';
import { HowItWorksSection } from './landing/HowItWorksSection';
import { ReasonsSection } from './landing/ReasonsSection';
import { WhatsInsideSection } from './landing/WhatsInsideSection';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    navigate('/app/onboarding');
  }, [navigate]);

  const topGuides = [...GUIDE_META]
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
    .slice(0, 4);

  return (
    <div className="flex flex-col flex-1 w-full">
      <header className="flex justify-end mb-4 sm:mb-6">
        <LoginButton redirectPath="/app/onboarding" showProfileWhenAuthed />
      </header>

      <HeroSection onStart={handleStart} />
      <BenefitsSection onStart={handleStart} />
      <HowItWorksSection />
      <DealTypesSection />
      <ReasonsSection />
      <WhatsInsideSection />
      <ArticlesSection guides={topGuides} />
      <FinalCtaSection onStart={handleStart} />
    </div>
  );
};
