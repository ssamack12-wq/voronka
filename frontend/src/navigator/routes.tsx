import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { fetchAdminAccess } from '../auth/api';
import { ensureApiSession } from '../auth/session';
import { useAuthStore } from '../auth/store';
import { isAppAdmin } from './engine/planAccess';
import { useNavigator } from './store/NavigatorContext';
import { ChecklistItemScreen } from './screens/ChecklistItemScreen';
import { DealDashboard } from './screens/DealDashboard';
import { CalendarScreen } from './screens/CalendarScreen';
import { LeadScreen } from './screens/LeadScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { MyDealsScreen } from './screens/MyDealsScreen';
import { ScenarioSelection } from './screens/ScenarioSelection';
import { StepDetail } from './screens/StepDetail';
import { DealQuiz } from './onboarding/DealQuiz';
import { OnboardingIntro } from './onboarding/OnboardingIntro';
import { QuizResults } from './onboarding/QuizResults';
import { PaymentReturnScreen } from './screens/PaymentReturnScreen';
import { AdminScreen } from './screens/AdminScreen';
import { SubscriptionPlanScreen } from './screens/SubscriptionPlanScreen';
import { Skeleton } from './components/ui';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser } = useAuthStore();
  const [gate, setGate] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sessionUser = await ensureApiSession();
      if (cancelled) return;
      if (!sessionUser || !isAppAdmin(sessionUser)) {
        setGate('denied');
        return;
      }
      setUser(sessionUser);
      try {
        const { isAdmin } = await fetchAdminAccess();
        if (cancelled) return;
        setGate(isAdmin ? 'ok' : 'denied');
      } catch {
        if (cancelled) return;
        setGate(isAppAdmin(sessionUser) ? 'ok' : 'denied');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  if (gate === 'loading') {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (gate === 'denied') {
    return <Navigate to="/app/profile" replace />;
  }
  return <>{children}</>;
};

export const NavigatorRoutes: React.FC = () => {
  const { progress } = useNavigator();
  const location = useLocation();

  const defaultPath = progress ? 'deal' : 'onboarding';

  return (
    <Routes location={location} key={location.pathname}>
      <Route index element={<Navigate to={defaultPath} replace />} />
      <Route path="onboarding" element={<OnboardingIntro />} />
      <Route path="onboarding/quiz" element={<DealQuiz />} />
      <Route path="onboarding/results" element={<QuizResults />} />
      <Route path="scenarios" element={<ScenarioSelection />} />
      <Route path="deals" element={<MyDealsScreen />} />
      <Route path="deal" element={<DealDashboard />} />
      <Route path="deal/step/:stepId" element={<StepDetail />} />
      <Route path="deal/step/:stepId/item/:itemId" element={<ChecklistItemScreen />} />
      <Route path="calendar" element={<CalendarScreen />} />
      <Route path="documents" element={<Navigate to="/app/calendar" replace />} />
      <Route path="profile" element={<ProfileScreen />} />
      <Route path="subscription/:planId" element={<SubscriptionPlanScreen />} />
      <Route
        path="admin"
        element={
          <AdminRoute>
            <AdminScreen />
          </AdminRoute>
        }
      />
      <Route path="lead" element={<LeadScreen />} />
      <Route path="payment/return" element={<PaymentReturnScreen />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
};

export function useNavigatorTab(): 'deal' | 'deals' | 'calendar' | 'profile' {
  const { pathname } = useLocation();
  if (pathname.includes('/deals')) return 'deals';
  if (pathname.includes('/calendar') || pathname.includes('/documents')) return 'calendar';
  if (pathname.includes('/profile')) return 'profile';
  return 'deal';
}

export function shouldHideBottomNav(pathname: string): boolean {
  return (
    pathname.includes('/deal/step/') ||
    pathname.includes('/lead') ||
    pathname.includes('/onboarding') ||
    pathname.includes('/scenarios') ||
    pathname.includes('/admin') ||
    pathname.includes('/subscription/')
  );
}
