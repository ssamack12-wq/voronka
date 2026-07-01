import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTutorial } from '../data/tutorials';
import { Header } from '../components/Header';
import { PageShell, PrimaryButton, SecondaryButton } from '../components/ui';
import { useNavigator } from '../store/NavigatorContext';

export const ChecklistItemScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    deal,
    progress,
    selectedStepId,
    selectedChecklistId,
    selectedTutorialId,
    setSelectedTutorialId,
    openLeadModal,
    clearTutorial,
    isFavorite,
    toggleFavorite
  } = useNavigator();

  if (!deal || !progress || !selectedStepId) return null;

  const step = deal.steps.find((s) => s.id === selectedStepId);
  const item = step?.checklist.find((c) => c.id === selectedChecklistId);
  const tutorial = selectedTutorialId ? getTutorial(selectedTutorialId, progress.scenarioId) : null;
  const favoriteId = selectedChecklistId
    ? `checklist:${selectedStepId}:${selectedChecklistId}`
    : `step:${selectedStepId}`;
  const returnScrollY = (location.state as { returnScrollY?: number } | null)?.returnScrollY ?? 0;

  const openTutorialFlow = () => {
    if (!selectedTutorialId || !selectedStepId) return;
    setSelectedTutorialId(selectedTutorialId);
    navigate(`/app/deal/step/${selectedStepId}`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title={item?.title ?? 'Задача'}
        onBack={() => {
          if (selectedTutorialId) {
            window.history.back();
            return;
          }
          clearTutorial();
          navigate(`/app/deal/step/${selectedStepId}`, { state: { returnScrollY } });
        }}
        showBookmark
        bookmarked={isFavorite(favoriteId)}
        onBookmark={() => toggleFavorite(favoriteId)}
      />
      <PageShell className="flex-1 flex flex-col">
        {item?.description && (
          <p className="text-sm text-graphite-muted mb-6">{item.description}</p>
        )}

        {tutorial ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
            <p className="text-graphite-muted text-sm mb-6">
              Подробная инструкция с пошаговыми действиями, FAQ и полезными ссылками.
            </p>
            <PrimaryButton onClick={openTutorialFlow}>Открыть инструкцию</PrimaryButton>
            <div className="mt-3 w-full">
              <SecondaryButton onClick={openLeadModal}>Нужна помощь специалиста</SecondaryButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-graphite-muted">
              Для этой задачи подготовлена базовая инструкция на экране шага.
            </p>
            <PrimaryButton onClick={() => navigate(`/app/deal/step/${selectedStepId}`)}>
              Вернуться к шагу
            </PrimaryButton>
          </div>
        )}
      </PageShell>
    </div>
  );
};
