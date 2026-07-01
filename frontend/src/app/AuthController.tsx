import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';
import { normalizeRedirectPath } from '../auth/redirectPath';
import { useAuthStore } from '../auth/store';

/** Глобальная сессия, magic link и редирект после входа. */
export const AuthController: React.FC = () => {
  const navigate = useNavigate();
  const { authModalOpen, redirectPath, user, checkSession } = useAuthStore();

  useEffect(() => {
    void checkSession();
    const interval = window.setInterval(
      () => void checkSession({ silent: true }),
      10 * 60 * 1000
    );
    return () => window.clearInterval(interval);
  }, [checkSession]);

  useEffect(() => {
    if (!user || !redirectPath) return;
    navigate(normalizeRedirectPath(redirectPath), { replace: true });
    useAuthStore.setState({ redirectPath: null });
  }, [user, redirectPath, navigate]);

  return <AuthModal open={authModalOpen} />;
};
