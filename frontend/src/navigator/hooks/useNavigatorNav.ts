import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function useNavigatorNav() {
  const navigate = useNavigate();
  const params = useParams();

  return {
    stepId: params.stepId ?? null,
    itemId: params.itemId ?? null,
    goScenarios: useCallback(() => navigate('/app/scenarios'), [navigate]),
    goDeal: useCallback(() => navigate('/app/deal'), [navigate]),
    goCalendar: useCallback(() => navigate('/app/calendar'), [navigate]),
    goProfile: useCallback(() => navigate('/app/profile'), [navigate]),
    goLead: useCallback(() => navigate('/app/lead'), [navigate]),
    goStep: useCallback((stepId: string) => navigate(`/app/deal/step/${stepId}`), [navigate]),
    goChecklistItem: useCallback(
      (stepId: string, itemId: string) =>
        navigate(`/app/deal/step/${stepId}/item/${itemId}`),
      [navigate]
    ),
    goBackFromStep: useCallback(() => navigate(-1), [navigate]),
    exitToLanding: useCallback(() => navigate('/'), [navigate])
  };
}
