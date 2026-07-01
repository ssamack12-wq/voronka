import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as authApi from '../auth/api';
import { persistSession } from '../auth/session';
import { normalizeRedirectPath } from '../auth/redirectPath';
import { useAuthStore } from '../auth/store';
import { PrimaryButton } from '../navigator/components/ui';

export const AuthVerifyPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const token = useMemo(() => params.get('token')?.trim() ?? '', [params]);

  const completeLogin = useCallback(
    async (user: NonNullable<Awaited<ReturnType<typeof authApi.verifyMagicToken>>['user']>) => {
      persistSession(user, authApi.readAccessToken());
      setUser(user);
      const redirect = normalizeRedirectPath(useAuthStore.getState().redirectPath, '/app/deal');
      useAuthStore.setState({ redirectPath: null });
      setDone(true);
      navigate(redirect, { replace: true });
    },
    [navigate, setUser]
  );

  const handleConfirmLogin = async () => {
    if (!token) {
      setError('Ссылка недействительна');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.verifyMagicToken(token);
      await completeLogin(data.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="max-w-sm w-full text-center">
          <p className="text-risk font-medium">Ссылка недействительна</p>
          <button
            type="button"
            className="mt-4 text-accent text-sm font-semibold"
            onClick={() => {
              useAuthStore.getState().openAuthModal('/app');
              navigate('/app');
            }}
          >
            Запросить новую ссылку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="max-w-sm w-full text-center space-y-4">
        {done ? (
          <p className="text-sm text-graphite-muted">Вход выполнен, перенаправляем…</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-graphite">Вход в навигатор</h1>
            <p className="text-sm text-graphite-muted leading-relaxed">
              Нажмите кнопку ниже, чтобы подтвердить вход. Так ссылка из письма не сгорает из‑за
              автоматических проверок почтовых сервисов.
            </p>
            {error && <p className="text-sm text-risk">{error}</p>}
            <PrimaryButton disabled={loading} onClick={() => void handleConfirmLogin()}>
              {loading ? 'Входим…' : 'Войти по ссылке'}
            </PrimaryButton>
            <button
              type="button"
              className="text-sm text-accent font-semibold"
              onClick={() => {
                useAuthStore.getState().openAuthModal('/app');
                navigate('/app');
              }}
            >
              Войти по коду из письма
            </button>
          </>
        )}
      </div>
    </div>
  );
};
