import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MetrikaPageView } from './analytics/MetrikaPageView';
import { AuthController } from './app/AuthController';
import { AuthVerifyPage } from './app/AuthVerifyPage';
import { ProtectedRoute } from './app/ProtectedRoute';
import { NavigatorApp } from './navigator/NavigatorApp';
import { LandingPage } from './pages/LandingPage';
import { QuizApp } from './quiz/QuizApp';
import { GuideHubPage } from './guide/pages/GuideHubPage';
import { GuideArticlePage } from './guide/pages/GuideArticlePage';

const STAGE_TRANSITION_MS = 240;

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-white flex justify-center w-full">
    <PageTransition>{children}</PageTransition>
  </div>
);

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    setVisible(false);
    const t = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      className={`w-full max-w-screen-mobile px-4 py-3 sm:py-6 flex flex-col min-h-screen transition-all ease-in-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ transitionDuration: `${STAGE_TRANSITION_MS}ms` }}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <MetrikaPageView />
    <AuthController />
    <Routes>
      <Route path="/auth/verify" element={<AuthVerifyPage />} />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-surface sm:bg-white flex justify-center w-full">
              <NavigatorApp />
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<AppShell><LandingPage /></AppShell>} />
      <Route path="/guide" element={<GuideHubPage />} />
      <Route path="/guide/:slug" element={<GuideArticlePage />} />
      <Route
        path="/quiz"
        element={
          <AppShell>
            <QuizApp onBackToLanding={() => window.history.back()} />
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
