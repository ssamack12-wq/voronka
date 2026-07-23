import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Crown,
  Calendar,
  HelpCircle,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Settings,
  User,
  X
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store';
import { isAppAdmin, planLabel, resolveEffectivePlan } from '../engine/planAccess';
import { useNavigator } from '../store/NavigatorContext';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { logout, user, requestAccess, openAuthModal } = useAuthStore();
  const { progress, resetDeal, openLeadModal } = useNavigator();
  const plan = resolveEffectivePlan(user, progress);

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const requireAuth = async (path: string) => {
    onClose();
    if (user) {
      navigate(path);
      return;
    }
    const ok = await requestAccess(path);
    if (ok) navigate(path);
  };

  const protectedItems = [
    { icon: Home, label: 'Мои сделки', path: '/app/deals', needsAuth: true },
    { icon: Calendar, label: 'Календарь', path: '/app/calendar', needsAuth: true }
  ];

  const publicItems = [
    { icon: BookOpen, label: 'Руководства', path: '/guide' },
    { icon: LayoutGrid, label: 'Все сценарии', path: '/app/scenarios' },
    { icon: HelpCircle, label: 'Помощь специалиста', action: () => openLeadModal() }
  ];

  const accountItems = user
    ? [
        {
          icon: Crown,
          label: `Тариф: ${planLabel(plan)}`,
          path: '/app/profile'
        },
        { icon: Settings, label: 'Настройки', path: '/app/profile' },
        { icon: User, label: 'Профиль', path: '/app/profile' },
        ...(isAppAdmin(user)
          ? [{ icon: Crown, label: 'Админ-панель', path: '/app/admin' as const }]
          : [])
      ]
    : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[55]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-[56] w-[min(320px,88vw)] drawer-panel flex flex-col safe-bottom"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="drawer-header">
              <div>
                <p className="font-semibold text-graphite">Навигатор сделки</p>
                <p className="text-desc text-graphite-muted truncate max-w-[200px]">
                  {user?.email ?? 'Гость — вход необязателен'}
                </p>
              </div>
              <button type="button" onClick={onClose} className="close-btn" aria-label="Закрыть меню">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('/app/deal');
                  }}
                  className="nav-item nav-item--accent mb-2"
                >
                  <LogIn className="w-5 h-5 shrink-0" />
                  Войти
                </button>
              )}

              {publicItems.map(({ icon: Icon, label, path, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => (action ? (action(), onClose()) : path && go(path))}
                  className="nav-item"
                >
                  <Icon className="w-5 h-5 text-accent shrink-0" />
                  {label}
                </button>
              ))}

              {protectedItems.map(({ icon: Icon, label, path, needsAuth }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    needsAuth && !user ? void requireAuth(path) : go(path)
                  }
                  className="nav-item"
                >
                  <Icon className="w-5 h-5 text-accent shrink-0" />
                  {label}
                  {!user && needsAuth && (
                    <span className="ml-auto text-[10px] text-graphite-muted">вход</span>
                  )}
                </button>
              ))}

              {accountItems.map(({ icon: Icon, label, path }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(path)}
                  className="nav-item"
                >
                  <Icon className="w-5 h-5 text-accent shrink-0" />
                  {label}
                  {label.startsWith('Тариф') && plan !== 'base' && (
                    <span className="ml-auto text-[10px] font-medium text-accent uppercase">
                      {planLabel(plan)}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-3 border-t border-black/[0.06] space-y-2">
              {progress && (
                <button
                  type="button"
                  onClick={() => {
                    resetDeal();
                    onClose();
                    go('/app/onboarding');
                  }}
                  className="w-full py-2.5 text-sm text-graphite-muted font-medium"
                >
                  Новая сделка
                </button>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    onClose();
                    navigate('/');
                  }}
                  className="nav-item nav-item--danger"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  Выйти
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
