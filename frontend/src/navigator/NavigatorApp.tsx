import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { Skeleton } from './components/ui';
import { NavigatorRoutes, shouldHideBottomNav, useNavigatorTab } from './routes';
import { NavigatorProvider, useNavigator } from './store/NavigatorContext';
import { resolveEffectivePlan, canAccessTutorials } from './engine/planAccess';
import { useAuthStore } from '../auth/store';
import { canGuestUseCalendar } from './engine/guestAccess';
import { PlanPaywall } from './screens/PlanPaywall';
import { InstallPwa } from '../components/InstallPwa';
import { LeadModal } from './components/LeadModal';
import { TutorialDrawer } from './screens/TutorialDrawer';

const NavigatorShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = useNavigatorTab();
  const { user, requestAccess } = useAuthStore();
  const {
    progress,
    isLoading,
    selectedTutorialId,
    selectedStepId,
    clearTutorial,
    drawerOpen,
    setDrawerOpen,
    leadModalOpen,
    closeLeadModal
  } = useNavigator();

  const [paywallOpen, setPaywallOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const plan = resolveEffectivePlan(user, progress);
  const hideBottomNav = shouldHideBottomNav(location.pathname) || paywallOpen || tutorialOpen;

  useEffect(() => {
    if (!selectedTutorialId) {
      setPaywallOpen(false);
      setTutorialOpen(false);
      return;
    }
    if (canAccessTutorials(plan)) {
      setPaywallOpen(false);
      setTutorialOpen(true);
    } else {
      setPaywallOpen(true);
      setTutorialOpen(false);
    }
  }, [selectedTutorialId, plan]);

  const handleTabChange = (t: typeof tab) => {
    if (t === 'deal') navigate(progress ? '/app/deal' : '/app/onboarding');
    if (t === 'deals') {
      if (!user) {
        void requestAccess('/app/deals');
        return;
      }
      navigate('/app/deals');
    }
    if (t === 'calendar') {
      if (!canGuestUseCalendar(user)) {
        void requestAccess('/app/calendar');
        return;
      }
      navigate('/app/calendar');
    }
    if (t === 'profile') {
      if (!user) {
        void requestAccess('/app/profile');
        return;
      }
      navigate('/app/profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 p-4 gap-3 min-h-screen">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white w-full max-w-lg mx-auto overflow-x-hidden shadow-sm md:shadow-card md:my-4 md:rounded-3xl md:border md:border-gray-100 md:min-h-[640px] md:max-h-[900px] md:overflow-hidden relative">
      <div
        className={`flex-1 flex flex-col min-h-0 min-w-0 overflow-x-hidden overflow-y-hidden ${hideBottomNav ? '' : 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]'}`}
      >
        <AnimatePresence mode="wait">
          <NavigatorRoutes />
        </AnimatePresence>
      </div>

      <BottomNav active={tab} onChange={handleTabChange} hidden={hideBottomNav} />

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <PlanPaywall
        open={paywallOpen}
        tutorialId={selectedTutorialId}
        targetPlan="safe"
        onClose={() => {
          setPaywallOpen(false);
          clearTutorial();
        }}
      />

      <TutorialDrawer
        open={tutorialOpen}
        tutorialId={selectedTutorialId}
        stepId={selectedStepId}
        onClose={() => {
          setTutorialOpen(false);
          clearTutorial();
        }}
      />

      <LeadModal open={leadModalOpen} onClose={closeLeadModal} />

      <InstallPwa />
    </div>
  );
};

export const NavigatorApp: React.FC = () => (
  <NavigatorProvider>
    <NavigatorShell />
  </NavigatorProvider>
);
