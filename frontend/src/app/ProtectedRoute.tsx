import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../auth/store';
import { Skeleton } from '../navigator/components/ui';

/** Проверка сессии без блокировки доступа — авторизация добровольная. */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, checkSession } = useAuthStore();
  const sessionChecked = useRef(false);

  useEffect(() => {
    if (sessionChecked.current) return;
    sessionChecked.current = true;
    void checkSession();
  }, [checkSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center p-4">
        <div className="w-full max-w-lg space-y-3 pt-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <div className="sr-only" aria-hidden>
        <Link to="/">Главная</Link>
        <Link to="/guide">Руководства</Link>
      </div>
    </>
  );
};
