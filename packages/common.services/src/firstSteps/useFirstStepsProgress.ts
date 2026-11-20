import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userStorageItemsQueryKeys } from 'common.api';
import { getCurrentUserStorageItem } from '../userStorageItems/getCurrentUserStorageItem';
import { stepsForRole, type FirstStepId, type FirstStepMark, type FirstStepsRole } from './model';
import { trackFirstStepsStepResolved } from './analytics';
import { resolveInviteDoneImport } from './inviteGate';
import { reconcileFirstSteps } from './reconcileFirstSteps';
import { firstStepsProgressStorageKey, progressRemoteFromQuery } from './stageDocument';
import { saveFirstStepsProgress } from './syncStage';
import {
  browserFirstStepsStorage,
  commitFirstStep,
  FIRST_STEPS_PROGRESS_EVENT,
  markIntroSeen,
  readFirstStepMarks,
  readIntroSeen,
} from './storage';

const marksEqual = (
  role: FirstStepsRole,
  left: Record<FirstStepId, FirstStepMark>,
  right: Record<FirstStepId, FirstStepMark>,
): boolean => stepsForRole(role).every((step) => left[step] === right[step]);

export const useFirstStepsProgress = (
  userId: number,
  role: FirstStepsRole,
  options?: { analytics?: boolean },
) => {
  const analytics = options?.analytics !== false;
  const storage = useMemo(() => browserFirstStepsStorage(), []);
  const queryClient = useQueryClient();
  const [marks, setMarks] = useState<Record<FirstStepId, FirstStepMark>>(() =>
    readFirstStepMarks(storage, userId, role),
  );
  const [introSeen, setIntroSeen] = useState(() => readIntroSeen(storage, userId, role));

  const progressKey = firstStepsProgressStorageKey(role);
  const progressQuery = useQuery({
    queryKey: userStorageItemsQueryKeys.current(userId, progressKey),
    queryFn: () => getCurrentUserStorageItem(progressKey),
  });

  const settled = progressQuery.isSuccess || progressQuery.isError;
  const remoteSignature = progressQuery.isSuccess
    ? JSON.stringify(progressQuery.data ?? null)
    : progressQuery.isError
      ? 'e'
      : 'x';

  const progressQueryRef = useRef(progressQuery);
  progressQueryRef.current = progressQuery;

  const publish = useCallback(() => {
    setMarks((current) => {
      const next = readFirstStepMarks(storage, userId, role);
      return marksEqual(role, current, next) ? current : next;
    });
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

  const inviteImportRef = useRef<{ userId: number; role: FirstStepsRole; allow: boolean } | null>(
    null,
  );
  const runRef = useRef(0);

  useEffect(() => {
    if (!settled) return;
    const run = ++runRef.current;

    void (async () => {
      let gate = inviteImportRef.current;
      if (!gate || gate.userId !== userId || gate.role !== role) {
        const allow = await resolveInviteDoneImport(storage, userId, role);
        if (runRef.current !== run) return;
        gate = { userId, role, allow };
        inviteImportRef.current = gate;
      }

      const progress = progressQueryRef.current;
      const remote = progressRemoteFromQuery(
        role,
        progress.isError ? 'error' : progress.isSuccess ? 'success' : 'pending',
        progress.data,
      );
      await reconcileFirstSteps({
        storage,
        userId,
        role,
        remoteStages: remote.stages,
        remoteIntro: remote.intro,
        remoteDemoCabinet: remote.demoCabinet,
        ignoreInviteDone: !gate.allow,
        queryClient,
      });

      if (runRef.current !== run) return;
      publish();
      setIntroSeen((current) => {
        const next = readIntroSeen(storage, userId, role);
        return current === next ? current : next;
      });
    })().catch((error: unknown) => {
      console.error('Не удалось синхронизировать первые шаги', error);
    });
  }, [introSeen, publish, queryClient, role, settled, remoteSignature, storage, userId]);

  const remember = useCallback(
    (step: FirstStepId, mark: Exclude<FirstStepMark, 'pending'>, source: 'skip' | 'auto') => {
      const changed = commitFirstStep(storage, userId, role, step, mark, true);
      if (!changed) return;
      if (analytics) trackFirstStepsStepResolved(role, step, mark, source);
      publish();
      void saveFirstStepsProgress(queryClient, storage, userId, role);
    },
    [analytics, publish, queryClient, role, storage, userId],
  );

  const markDone = useCallback((step: FirstStepId) => remember(step, 'done', 'auto'), [remember]);
  const markSkipped = useCallback(
    (step: FirstStepId) => remember(step, 'skipped', 'skip'),
    [remember],
  );
  const startGuide = useCallback(() => {
    markIntroSeen(storage, userId, role);
    setIntroSeen(true);
    void saveFirstStepsProgress(queryClient, storage, userId, role);
  }, [queryClient, role, storage, userId]);

  return {
    marks,
    introSeen,
    startGuide,
    markDone,
    markSkipped,
  };
};
