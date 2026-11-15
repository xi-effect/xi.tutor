import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { userFlagsQueryKeys } from 'common.api';
import { getCurrentUserFlag } from '../userFlags';
import { useUpdateUserFlag } from '../userFlags/useUpdateUserFlag';
import {
  firstStepFlagKey,
  stepsForRole,
  type FirstStepId,
  type FirstStepMark,
  type FirstStepsRole,
} from './model';
import { trackFirstStepsStepResolved } from './analytics';
import {
  acknowledgeFirstStepFlag,
  applyRemoteFirstStep,
  browserFirstStepsStorage,
  clearFirstStepDone,
  commitFirstStep,
  FIRST_STEPS_PROGRESS_EVENT,
  dirtyFirstStepFlags,
  markIntroSeen,
  readFirstStepMarks,
  readIntroSeen,
} from './storage';

const readFlag = async (key: string): Promise<boolean> => {
  try {
    return await getCurrentUserFlag(key);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return false;
    throw error;
  }
};

const flagKeysForRole = (role: FirstStepsRole): string[] =>
  stepsForRole(role).flatMap((step) => [
    firstStepFlagKey(role, step, 'done'),
    firstStepFlagKey(role, step, 'skip'),
  ]);

const inviteTourMarkKey = (userId: number) => `sovlium.firstSteps.inviteMarkedByTour.${userId}`;

export const useFirstStepsProgress = (
  userId: number,
  role: FirstStepsRole,
  options?: { analytics?: boolean },
) => {
  const analytics = options?.analytics !== false;
  const storage = useMemo(() => browserFirstStepsStorage(), []);
  const stepIds = stepsForRole(role);
  const [marks, setMarks] = useState<Record<FirstStepId, FirstStepMark>>(() =>
    readFirstStepMarks(storage, userId, role),
  );
  const [introSeen, setIntroSeen] = useState(() => readIntroSeen(storage, userId, role));
  const { updateUserFlag } = useUpdateUserFlag();
  const mutateRef = useRef(updateUserFlag.mutate);
  mutateRef.current = updateUserFlag.mutate;

  const flagQueries = useQueries({
    queries: flagKeysForRole(role).map((flagKey) => ({
      queryKey: userFlagsQueryKeys.current(userId, flagKey),
      queryFn: () => readFlag(flagKey),
    })),
  });

  const flagsSettled = flagQueries.every((query) => query.isSuccess || query.isError);
  const remoteSignature = flagQueries
    .map((query) => (query.isSuccess ? (query.data ? '1' : '0') : 'x'))
    .join('');
  const remoteRef = useRef(flagQueries);
  remoteRef.current = flagQueries;

  const publish = useCallback(() => {
    setMarks(readFirstStepMarks(storage, userId, role));
  }, [role, storage, userId]);

  useEffect(() => {
    publish();
    setIntroSeen(readIntroSeen(storage, userId, role));
  }, [publish, role, storage, userId]);

  useEffect(() => {
    const onProgress = () => publish();
    window.addEventListener(FIRST_STEPS_PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(FIRST_STEPS_PROGRESS_EVENT, onProgress);
  }, [publish]);

  const allowRemoteInviteDone = useRef<boolean | null>(null);
  const inviteWasDoneAtStart = useRef(
    role === 'tutor' && readFirstStepMarks(storage, userId, role).invite === 'done',
  );

  useEffect(() => {
    if (!flagsSettled) return;

    if (allowRemoteInviteDone.current == null) {
      let allowed = true;
      if (role === 'tutor' && typeof window !== 'undefined') {
        const key = inviteTourMarkKey(userId);
        try {
          allowed = window.localStorage.getItem(key) === '1';
          if (!allowed) {
            window.localStorage.setItem(key, '1');
            if (inviteWasDoneAtStart.current) clearFirstStepDone(storage, userId, role, 'invite');
            mutateRef.current({
              key: firstStepFlagKey(role, 'invite', 'done'),
              value: false,
            });
          }
        } catch {
          allowed = true;
        }
      }
      allowRemoteInviteDone.current = allowed;
    }

    let changed = false;
    stepIds.forEach((step, index) => {
      const doneQuery = remoteRef.current[index * 2];
      const skippedQuery = remoteRef.current[index * 2 + 1];
      if (!doneQuery?.isSuccess || !skippedQuery?.isSuccess) return;
      const done =
        doneQuery.data === true && (step !== 'invite' || allowRemoteInviteDone.current === true);
      const skipped = skippedQuery.data === true;
      if (applyRemoteFirstStep(storage, userId, role, step, { done, skipped })) changed = true;
    });

    if (changed) publish();
  }, [flagsSettled, publish, remoteSignature, role, stepIds, storage, userId]);

  const flushDirty = useCallback(() => {
    const keys = flagKeysForRole(role);
    for (const flagKey of dirtyFirstStepFlags(storage, userId, role)) {
      const queryIndex = keys.indexOf(flagKey);
      if (queryIndex >= 0 && remoteRef.current[queryIndex]?.data === true) {
        acknowledgeFirstStepFlag(storage, userId, role, flagKey);
        continue;
      }

      mutateRef.current(
        { key: flagKey, value: true },
        {
          onSuccess: () => acknowledgeFirstStepFlag(storage, userId, role, flagKey),
        },
      );
    }
  }, [role, storage, userId]);

  useEffect(() => {
    if (!flagsSettled) return;
    flushDirty();
  }, [flagsSettled, flushDirty, marks, remoteSignature]);

  const remember = useCallback(
    (step: FirstStepId, mark: Exclude<FirstStepMark, 'pending'>, source: 'skip' | 'auto') => {
      const changed = commitFirstStep(storage, userId, role, step, mark, true);
      if (changed) {
        if (analytics) trackFirstStepsStepResolved(role, step, mark, source);
        publish();
      }
    },
    [analytics, publish, role, storage, userId],
  );

  const markDone = useCallback((step: FirstStepId) => remember(step, 'done', 'auto'), [remember]);
  const markSkipped = useCallback(
    (step: FirstStepId) => remember(step, 'skipped', 'skip'),
    [remember],
  );
  const startGuide = useCallback(() => {
    markIntroSeen(storage, userId, role);
    setIntroSeen(true);
  }, [role, storage, userId]);

  return {
    marks,
    introSeen,
    startGuide,
    markDone,
    markSkipped,
  };
};
