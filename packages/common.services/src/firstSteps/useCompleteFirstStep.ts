import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../user';
import { isStepForRole, type FirstStepId } from './model';
import { shouldShowFirstSteps } from './preview';
import { trackFirstStepsStepResolved, type FirstStepsResolveSource } from './analytics';
import { saveFirstStepsProgress } from './syncStage';
import { browserFirstStepsStorage, commitFirstStep, dirtyFirstSteps } from './storage';

type FirstStepUser = {
  id: number;
  default_layout?: string | null;
  onboarding_stage?: string | null;
};

/** Отмечает шаг выполненным, если пользователь сейчас на этапе обучения. */
export const markFirstStepDone = (
  user: FirstStepUser | null | undefined,
  step: FirstStepId,
  queryClient: QueryClient,
  source: FirstStepsResolveSource = 'tour',
) => {
  if (!user || typeof user.id !== 'number') return;
  if (!shouldShowFirstSteps(user.onboarding_stage ?? undefined)) return;

  const role = user.default_layout;
  if ((role !== 'tutor' && role !== 'student') || !isStepForRole(role, step)) return;

  const storage = browserFirstStepsStorage();
  const changed = commitFirstStep(storage, user.id, role, step, 'done', true);
  if (changed && user.onboarding_stage === 'training') {
    trackFirstStepsStepResolved(role, step, 'done', source);
  }

  if (!dirtyFirstSteps(storage, user.id, role).includes(step)) return;
  void saveFirstStepsProgress(queryClient, storage, user.id, role);
};

/** Отмечает шаг выполненным, если пользователь сейчас на этапе обучения. */
export const useCompleteFirstStep = (step: FirstStepId, active: boolean) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  useEffect(() => {
    if (!active) return;
    markFirstStepDone(user, step, queryClientRef.current);
  }, [active, step, user]);
};

/** Отмечает шаг из обработчика, не дожидаясь ререндера. */
export const useMarkFirstStepDone = (step: FirstStepId) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userRef = useRef(user);
  const queryClientRef = useRef(queryClient);
  userRef.current = user;
  queryClientRef.current = queryClient;

  return useCallback(
    (source: FirstStepsResolveSource = 'tour') => {
      markFirstStepDone(userRef.current, step, queryClientRef.current, source);
    },
    [step],
  );
};
