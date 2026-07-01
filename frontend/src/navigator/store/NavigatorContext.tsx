import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as authApi from '../../auth/api';
import { useAuthStore } from '../../auth/store';
import {
  buildDealFromProgress,
  createInitialProgress,
  createProgressFromQuiz,
  migrateProgress
} from '../engine/buildDeal';
import { getTutorial } from '../data/tutorials';
import { resolveScenario, scenarioIdToQuizAnswers } from '../engine/resolveScenario';
import type {
  DealProgress,
  DealSummary,
  PlanTier,
  QuizAnswers,
  ResolvedDeal,
  StepStatus
} from '../types';
import {
  buildProgressFromPending,
  clearPendingQuiz
} from '../onboarding/pendingQuiz';
import { canGuestMarkSteps } from '../engine/guestAccess';
import {
  ensureDealId,
  loadDealsState,
  saveDealsState,
  toDealSummary
} from './dealsStorage';

interface NavigatorContextValue {
  deal: ResolvedDeal | null;
  progress: DealProgress | null;
  dealSummaries: DealSummary[];
  selectedStepId: string | null;
  selectedChecklistId: string | null;
  selectedTutorialId: string | null;
  favorites: string[];
  isLoading: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  leadModalOpen: boolean;
  openLeadModal: () => void;
  closeLeadModal: () => void;
  startScenario: (scenarioId: string) => void;
  startFromQuiz: (answers: QuizAnswers, plan?: PlanTier) => void;
  switchDeal: (dealId: string) => void;
  completeDeal: () => void;
  resetDeal: () => void;
  deleteActiveDeal: () => void;
  openStep: (stepId: string, returnScrollY?: number) => void;
  openChecklistItem: (stepId: string, checklistId: string, tutorialId?: string) => void;
  toggleChecklistItem: (stepId: string, itemId: string) => void;
  toggleTutorialSubtask: (stepId: string, subtaskId: string, allSubtaskIds: string[]) => void;
  setStepStatus: (stepId: string, status: StepStatus) => void;
  completeStep: (stepId: string) => void;
  isFavorite: (targetId: string) => boolean;
  toggleFavorite: (targetId: string) => void;
  clearTutorial: () => void;
  setSelectedTutorialId: (id: string | null) => void;
}

const NavigatorContext = createContext<NavigatorContextValue | null>(null);
const FAVORITES_KEY = 'tn-favorites-v1';

function pickActive(state: { activeDealId: string | null; deals: DealProgress[] }) {
  if (!state.deals.length) return null;
  if (state.activeDealId) {
    const found = state.deals.find((d) => d.id === state.activeDealId);
    if (found) return migrateProgress(found);
  }
  const active = state.deals.find((d) => d.status !== 'completed');
  return migrateProgress(active ?? state.deals[0]);
}

export const NavigatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [dealsState, setDealsState] = useState(() => loadDealsState());
  const [progress, setProgress] = useState<DealProgress | null>(() => pickActive(loadDealsState()));
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [selectedTutorialId, setSelectedTutorialId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(() => loadDealsState().deals.length === 0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [favoritesByDeal, setFavoritesByDeal] = useState<Record<string, string[]>>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    } catch {
      return {};
    }
  });
  const syncTimer = useRef<number | null>(null);

  const persistLocal = useCallback((nextDeals: DealProgress[], activeId: string | null) => {
    const state = { activeDealId: activeId, deals: nextDeals };
    saveDealsState(state);
    setDealsState(state);
  }, []);

  const applyProgress = useCallback(
    (next: DealProgress | null, options?: { syncRemote?: boolean }) => {
      if (!next) {
        setProgress(null);
        persistLocal([], null);
        if (options?.syncRemote !== false && user) {
          void authApi.syncDealProgress(null).catch(() => undefined);
        }
        return;
      }
      const normalized = ensureDealId(migrateProgress(next));
      normalized.updatedAt = new Date().toISOString();
      const others = dealsState.deals.filter((d) => d.id !== normalized.id);
      const nextDeals = [normalized, ...others];
      persistLocal(nextDeals, normalized.id!);
      setProgress(normalized);
      if (options?.syncRemote !== false && user) {
        if (syncTimer.current) window.clearTimeout(syncTimer.current);
        syncTimer.current = window.setTimeout(() => {
          void authApi.syncDealProgress(normalized).catch(() => undefined);
        }, 600);
      }
    },
    [dealsState.deals, persistLocal, user]
  );

  useEffect(() => {
    const init = async () => {
      let local = loadDealsState();

      if (user) {
        const pendingProgress = buildProgressFromPending();
        if (pendingProgress) {
          const normalized = ensureDealId(migrateProgress(pendingProgress));
          const others = local.deals.filter((d) => d.id !== normalized.id);
          local = { activeDealId: normalized.id!, deals: [normalized, ...others] };
          saveDealsState(local);
          clearPendingQuiz();
          void authApi.syncDealProgress(normalized).catch(() => undefined);
        }

        try {
          const remoteList = await authApi.listDeals();
          if (remoteList.deals?.length) {
            const merged = new Map<string, DealProgress>();
            for (const d of local.deals) {
              if (d.id) merged.set(d.id, d);
            }
            for (const item of remoteList.deals) {
              if (item.id) merged.set(item.id, migrateProgress(item));
            }
            local = {
              activeDealId: local.activeDealId ?? remoteList.deals[0]?.id ?? null,
              deals: [...merged.values()]
            };
            saveDealsState(local);
          } else if (local.deals.length) {
            for (const d of local.deals) {
              void authApi.syncDealProgress(ensureDealId(d)).catch(() => undefined);
            }
          }
        } catch {
          /* local only */
        }
      }

      setDealsState(local);
      const active = pickActive(local);
      setProgress(active);
      if (active && (location.pathname === '/app' || location.pathname === '/app/')) {
        navigate('/app/deal', { replace: true });
      }
      setIsLoading(false);
    };
    void init();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const match = location.pathname.match(/\/deal\/step\/([^/]+)/);
    setSelectedStepId(match?.[1] ?? null);
    const itemMatch = location.pathname.match(/\/item\/([^/]+)$/);
    setSelectedChecklistId(itemMatch?.[1] ?? null);
  }, [location.pathname]);

  const deal = useMemo(
    () => (progress ? buildDealFromProgress(progress) : null),
    [progress]
  );

  useEffect(() => {
    if (!deal || !progress) return;
    let changed = false;
    const nextSteps: DealProgress['steps'] = { ...progress.steps };

    for (const step of deal.steps) {
      const existing = nextSteps[step.id];
      const syncedChecklist = Object.fromEntries(
        step.checklist.map((item) => [item.id, existing?.checklist?.[item.id] === true])
      );
      const tut = getTutorial(step.tutorialIds[0] ?? `tut-${step.id}`, progress.scenarioId);
      const subtaskIds = tut?.subtasks?.map((s) => s.id) ?? [];
      const syncedSubtasks = Object.fromEntries(
        subtaskIds.map((id) => [id, existing?.subtasks?.[id] === true])
      );

      if (!existing) {
        nextSteps[step.id] = {
          status: 'not_started',
          checklist: syncedChecklist,
          subtasks: subtaskIds.length ? syncedSubtasks : undefined
        };
        changed = true;
        continue;
      }

      const sameLength = Object.keys(existing.checklist ?? {}).length === step.checklist.length;
      const sameKeys = step.checklist.every((item) => item.id in (existing.checklist ?? {}));
      const sameSubtasks =
        subtaskIds.length === 0 ||
        (subtaskIds.every((id) => id in (existing.subtasks ?? {})) &&
          Object.keys(existing.subtasks ?? {}).length === subtaskIds.length);
      if (!sameLength || !sameKeys || !sameSubtasks) {
        nextSteps[step.id] = {
          ...existing,
          checklist: syncedChecklist,
          subtasks: subtaskIds.length ? syncedSubtasks : existing.subtasks
        };
        changed = true;
      }
    }

    for (const stepId of Object.keys(nextSteps)) {
      if (!deal.steps.some((s) => s.id === stepId)) {
        delete nextSteps[stepId];
        changed = true;
      }
    }

    if (changed) {
      applyProgress({ ...progress, steps: nextSteps });
    }
  }, [deal, progress, applyProgress]);

  const dealSummaries = useMemo(
    () => dealsState.deals.map(toDealSummary).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [dealsState.deals]
  );

  const startFromQuiz = useCallback(
    (answers: QuizAnswers, plan: PlanTier = 'base') => {
      const initial = createProgressFromQuiz(answers, plan);
      if (!initial) return;
      applyProgress(initial, { syncRemote: !!user });
      setSelectedStepId(null);
      setSelectedTutorialId(null);
      navigate('/app/deal');
    },
    [applyProgress, navigate, user]
  );

  const startScenario = useCallback(
    (scenarioId: string) => {
      const answers = scenarioIdToQuizAnswers(scenarioId);
      const resolved = resolveScenario(answers);
      if (!resolved) return;
      const initial = createInitialProgress(resolved, answers, 'base');
      applyProgress(initial, { syncRemote: !!user });
      setSelectedStepId(null);
      setSelectedTutorialId(null);
      navigate('/app/deal');
    },
    [applyProgress, navigate, user]
  );

  const switchDeal = useCallback(
    (dealId: string) => {
      const found = dealsState.deals.find((d) => d.id === dealId);
      if (!found) return;
      setProgress(migrateProgress(found));
      persistLocal(dealsState.deals, dealId);
      navigate('/app/deal');
    },
    [dealsState.deals, navigate, persistLocal]
  );

  const completeDeal = useCallback(() => {
    if (!canGuestMarkSteps(user)) {
      void useAuthStore.getState().requestAccess('/app/deal');
      return;
    }
    if (!progress?.id) return;
    const completed: DealProgress = {
      ...progress,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    applyProgress(completed);
    navigate('/app/deals');
  }, [applyProgress, navigate, progress, user]);

  const resetDeal = useCallback(() => {
    setProgress(null);
    setSelectedStepId(null);
    setSelectedTutorialId(null);
    navigate('/app/onboarding');
  }, [navigate]);

  const deleteActiveDeal = useCallback(() => {
    if (!progress?.id) {
      resetDeal();
      return;
    }
    const dealId = progress.id;
    const remaining = dealsState.deals.filter((d) => d.id !== dealId);
    const nextActive =
      remaining.find((d) => d.status !== 'completed') ?? remaining[0] ?? null;
    persistLocal(remaining, nextActive?.id ?? null);
    setProgress(nextActive ? migrateProgress(nextActive) : null);
    setSelectedStepId(null);
    setSelectedTutorialId(null);
    if (user) {
      void authApi.deleteDealProgress(dealId).catch(() => undefined);
    }
    navigate(remaining.length > 0 ? '/app/deals' : '/app/onboarding');
  }, [dealsState.deals, navigate, persistLocal, progress?.id, resetDeal, user]);

  const openLeadModal = useCallback(() => {
    setLeadModalOpen(true);
  }, []);

  const openStep = useCallback(
    (stepId: string, returnScrollY = 0) => {
      if (!progress) {
        navigate(`/app/deal/step/${stepId}`, { state: { returnScrollY } });
        return;
      }
      const step = progress.steps[stepId];
      if (step?.status === 'not_started') {
        applyProgress({
          ...progress,
          updatedAt: new Date().toISOString(),
          steps: {
            ...progress.steps,
            [stepId]: { ...step, status: 'in_progress' }
          }
        });
      }
      navigate(`/app/deal/step/${stepId}`, { state: { returnScrollY } });
    },
    [applyProgress, navigate, progress]
  );

  const toggleChecklistItem = useCallback(
    (stepId: string, itemId: string) => {
      if (!canGuestMarkSteps(user)) {
        void useAuthStore.getState().requestAccess('/app/deal');
        return;
      }
      if (!progress) return;
      const step = progress.steps[stepId];
      if (!step) return;
      applyProgress({
        ...progress,
        updatedAt: new Date().toISOString(),
        steps: {
          ...progress.steps,
          [stepId]: {
            ...step,
            status: step.status === 'not_started' ? 'in_progress' : step.status,
            checklist: {
              ...step.checklist,
              [itemId]: !step.checklist[itemId]
            }
          }
        }
      });
    },
    [applyProgress, progress, user]
  );

  const toggleTutorialSubtask = useCallback(
    (stepId: string, subtaskId: string, allSubtaskIds: string[]) => {
      if (!canGuestMarkSteps(user)) {
        void useAuthStore.getState().requestAccess('/app/deal');
        return;
      }
      if (!progress) return;
      const step = progress.steps[stepId];
      if (!step) return;

      const nextSubtasks = {
        ...(step.subtasks ?? Object.fromEntries(allSubtaskIds.map((id) => [id, false]))),
        [subtaskId]: !(step.subtasks?.[subtaskId] ?? false)
      };
      const allComplete = allSubtaskIds.every((id) => nextSubtasks[id] === true);
      const nextStatus =
        allComplete ? 'completed' : step.status === 'not_started' ? 'in_progress' : step.status;

      applyProgress({
        ...progress,
        updatedAt: new Date().toISOString(),
        steps: {
          ...progress.steps,
          [stepId]: {
            ...step,
            status: nextStatus,
            subtasks: nextSubtasks
          }
        }
      });
    },
    [applyProgress, progress, user]
  );

  const setStepStatus = useCallback(
    (stepId: string, status: StepStatus) => {
      if (!canGuestMarkSteps(user)) {
        void useAuthStore.getState().requestAccess('/app/deal');
        return;
      }
      if (!progress) return;
      const step = progress.steps[stepId];
      if (!step) return;
      applyProgress({
        ...progress,
        updatedAt: new Date().toISOString(),
        steps: { ...progress.steps, [stepId]: { ...step, status } }
      });
    },
    [applyProgress, progress, user]
  );

  const completeStep = useCallback(
    (stepId: string) => {
      setStepStatus(stepId, 'completed');
      navigate('/app/deal');
      setSelectedStepId(null);
    },
    [setStepStatus, navigate]
  );

  const openChecklistItem = useCallback(
    (stepId: string, checklistId: string, tutorialId?: string) => {
      setSelectedTutorialId(tutorialId ?? null);
      navigate(`/app/deal/step/${stepId}/item/${checklistId}`);
    },
    [navigate]
  );

  const clearTutorial = useCallback(() => {
    setSelectedTutorialId(null);
    setSelectedChecklistId(null);
  }, []);

  const activeDealId = progress?.id ?? '';

  const persistFavorites = useCallback((next: Record<string, string[]>) => {
    setFavoritesByDeal(next);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const isFavorite = useCallback(
    (targetId: string) => {
      if (!activeDealId || !targetId) return false;
      return (favoritesByDeal[activeDealId] ?? []).includes(targetId);
    },
    [activeDealId, favoritesByDeal]
  );

  const toggleFavorite = useCallback(
    (targetId: string) => {
      if (!activeDealId || !targetId) return;
      const current = favoritesByDeal[activeDealId] ?? [];
      const exists = current.includes(targetId);
      const nextForDeal = exists ? current.filter((id) => id !== targetId) : [...current, targetId];
      persistFavorites({
        ...favoritesByDeal,
        [activeDealId]: nextForDeal
      });
    },
    [activeDealId, favoritesByDeal, persistFavorites]
  );

  const favorites = useMemo(() => {
    if (!activeDealId) return [];
    return favoritesByDeal[activeDealId] ?? [];
  }, [activeDealId, favoritesByDeal]);

  const value: NavigatorContextValue = {
    deal,
    progress,
    dealSummaries,
    selectedStepId,
    selectedChecklistId,
    selectedTutorialId,
    favorites,
    isLoading,
    drawerOpen,
    setDrawerOpen,
    leadModalOpen,
    openLeadModal,
    closeLeadModal: () => setLeadModalOpen(false),
    startScenario,
    startFromQuiz,
    switchDeal,
    completeDeal,
    resetDeal,
    deleteActiveDeal,
    openStep,
    openChecklistItem,
    toggleChecklistItem,
    toggleTutorialSubtask,
    setStepStatus,
    completeStep,
    isFavorite,
    toggleFavorite,
    clearTutorial,
    setSelectedTutorialId
  };

  return <NavigatorContext.Provider value={value}>{children}</NavigatorContext.Provider>;
};

export function useNavigator() {
  const ctx = useContext(NavigatorContext);
  if (!ctx) throw new Error('useNavigator must be used within NavigatorProvider');
  return ctx;
}
