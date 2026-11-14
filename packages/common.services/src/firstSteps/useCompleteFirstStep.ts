import { useEffect, useRef } from 'react';
import { useCurrentUser } from '../user';
import { useUpdateUserFlag } from '../userFlags';
import { firstStepFlagKey, isStepForRole, type FirstStepId } from './model';
import { shouldShowFirstSteps } from './preview';
import {
  acknowledgeFirstStepFlag,
  browserFirstStepsStorage,
  commitFirstStep,
  dirtyFirstStepFlags,
} from './storage';

type FirstStepUser = {
  id: number;
  default_layout?: string | null;
  onboarding_stage?: string | null;
};

/** Отмечает шаг выполненным, если пользователь сейчас на этапе обучения. */
export const markFirstStepDone = (
  user: FirstStepUser | null | undefined,
  step: FirstStepId,
  mutate: (
    variables: { key: string; value: boolean },
    options?: { onSuccess?: () => void },
  ) => void,
) => {
  if (!user || typeof user.id !== 'number') return;
  if (!shouldShowFirstSteps(user.onboarding_stage ?? undefined)) return;

  const role = user.default_layout;
  if ((role !== 'tutor' && role !== 'student') || !isStepForRole(role, step)) return;

  const storage = browserFirstStepsStorage();
  commitFirstStep(storage, user.id, role, step, 'done', true);

  const flagKey = firstStepFlagKey(role, step, 'done');
  if (!dirtyFirstStepFlags(storage, user.id, role).includes(flagKey)) return;

  mutate(
    { key: flagKey, value: true },
    {
      onSuccess: () => acknowledgeFirstStepFlag(storage, user.id, role, flagKey),
    },
  );
};

/** Отмечает шаг выполненным, если пользователь сейчас на этапе обучения. */
export const useCompleteFirstStep = (step: FirstStepId, active: boolean) => {
  const { data: user } = useCurrentUser();
  const { updateUserFlag } = useUpdateUserFlag();
  const mutateRef = useRef(updateUserFlag.mutate);
  mutateRef.current = updateUserFlag.mutate;

  useEffect(() => {
    if (!active) return;
    markFirstStepDone(user, step, mutateRef.current);
  }, [active, step, user]);
};
