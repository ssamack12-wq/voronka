import { Search, Shield, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { adminDeleteUser, adminSearchUsers, adminSetSubscription } from '../../auth/api';
import { ensureApiSession } from '../../auth/session';
import { useAuthStore } from '../../auth/store';
import type { AuthUser, PremiumStatus } from '../../auth/types';
import { premiumStatusLabel } from '../engine/planAccess';
import { Header } from '../components/Header';
import {
  Card,
  DangerButton,
  GhostButton,
  PageShell,
  PrimaryButton,
  SecondaryButton,
  SectionTitle
} from '../components/ui';

const STATUS_OPTIONS: PremiumStatus[] = ['free', 'safe', 'premium', 'expired', 'admin'];

const STEP_DOWN: Partial<Record<PremiumStatus, PremiumStatus>> = {
  admin: 'premium',
  premium: 'safe',
  safe: 'free',
  expired: 'free'
};

const STEP_UP: Partial<Record<PremiumStatus, PremiumStatus>> = {
  free: 'safe',
  safe: 'premium',
  premium: 'admin',
  expired: 'safe'
};

export const AdminScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    void ensureApiSession().then((u) => {
      if (u) setUser(u);
    });
  }, [setUser]);

  const runSearch = useCallback(
    async (q: string) => {
      setLoading(true);
      setError(null);
      try {
        const sessionUser = await ensureApiSession();
        if (!sessionUser) {
          setError('Войдите снова под gartem2109@yandex.ru');
          setUsers([]);
          return;
        }
        setUser(sessionUser);
        const list = await adminSearchUsers(q);
        setUsers(list);
      } catch (e) {
        const err = e as Error & { status?: number };
        if (err.status === 401) {
          setError('Сессия истекла. Выйдите и войдите снова.');
        } else if (err.status === 403) {
          setError('Доступ запрещён');
        } else {
          setError(err instanceof Error ? err.message : 'Ошибка поиска');
        }
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [setUser]
  );

  useEffect(() => {
    void runSearch('');
  }, [runSearch]);

  const updateStatus = async (target: AuthUser, next: PremiumStatus) => {
    setBusyId(target.id);
    setError(null);
    try {
      const updated = await adminSetSubscription(target.id, next);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обновить подписку');
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (target: AuthUser) => {
    setBusyId(target.id);
    setError(null);
    try {
      await adminDeleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setConfirmDeleteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить аккаунт');
    } finally {
      setBusyId(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <PageShell noPadding className="overflow-y-auto overflow-x-hidden pb-6 min-w-0 max-w-full">
      <Header title="Админ-панель" />
      <div className="px-4 space-y-4 min-w-0 max-w-full">
        <Card className="p-4 bg-accent-soft/30 border-accent/15 min-w-0">
          <div className="flex gap-3 min-w-0">
            <Shield className="w-5 h-5 text-accent shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-graphite">Управление подписками</p>
              <p className="text-xs text-graphite-muted mt-1">
                Поиск по email или ID. Подписка меняется здесь или после оплаты в ЮKassa.
              </p>
            </div>
          </div>
        </Card>

        <form
          className="space-y-2 min-w-0 max-w-full"
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch(query);
          }}
        >
          <label className="block min-w-0">
            <span className="sr-only">Поиск пользователя</span>
            <div className="relative w-full min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-muted pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Email или UUID пользователя"
                className="input-field !pl-9"
              />
            </div>
          </label>
          <PrimaryButton type="submit" disabled={loading} className="!min-h-[44px] !text-desc">
            {loading ? 'Поиск…' : 'Найти'}
          </PrimaryButton>
        </form>

        {error && <p className="text-sm text-risk break-words">{error}</p>}
        {loading && <p className="text-sm text-graphite-muted">Загрузка…</p>}

        <SectionTitle>Пользователи ({users.length})</SectionTitle>

        {users.length === 0 && !loading ? (
          <p className="text-sm text-graphite-muted">Никого не найдено</p>
        ) : (
          <div className="space-y-3 min-w-0">
            {users.map((u) => (
              <Card key={u.id} className="p-4 space-y-3 min-w-0 overflow-hidden">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-graphite break-words">{u.email}</p>
                  <p className="text-[11px] text-graphite-muted mt-0.5 font-mono break-all overflow-hidden">
                    {u.id}
                  </p>
                  <p className="text-xs text-accent mt-1">
                    Подписка: {premiumStatusLabel(u.premiumStatus)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <SecondaryButton
                    className="!w-auto flex-1 min-w-[7rem] !py-2 !px-3 !text-xs"
                    disabled={busyId === u.id || !STEP_DOWN[u.premiumStatus]}
                    onClick={() => {
                      const next = STEP_DOWN[u.premiumStatus];
                      if (next) void updateStatus(u, next);
                    }}
                  >
                    Уменьшить
                  </SecondaryButton>
                  <SecondaryButton
                    className="!w-auto flex-1 min-w-[7rem] !py-2 !px-3 !text-xs"
                    disabled={busyId === u.id || !STEP_UP[u.premiumStatus]}
                    onClick={() => {
                      const next = STEP_UP[u.premiumStatus];
                      if (next) void updateStatus(u, next);
                    }}
                  >
                    Начислить
                  </SecondaryButton>
                </div>

                <select
                  value={u.premiumStatus}
                  disabled={busyId === u.id}
                  onChange={(e) => void updateStatus(u, e.target.value as PremiumStatus)}
                  className="input-field !py-2.5"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {premiumStatusLabel(s)}
                    </option>
                  ))}
                </select>

                {confirmDeleteId === u.id ? (
                  <div className="flex gap-2 min-w-0">
                    <GhostButton className="flex-1 min-w-0" onClick={() => setConfirmDeleteId(null)}>
                      Отмена
                    </GhostButton>
                    <DangerButton
                      className="flex-1 min-w-0 !min-h-[44px] !text-desc"
                      disabled={busyId === u.id}
                      onClick={() => void removeUser(u)}
                    >
                      Подтвердить
                    </DangerButton>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === u.id || u.id === user.id}
                    onClick={() => setConfirmDeleteId(u.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-risk"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    Удалить аккаунт
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};
