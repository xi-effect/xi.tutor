import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient, useQueries } from '@tanstack/react-query';
import { userStorageItemsQueryKeys } from 'common.api';
import { getCurrentUserStorageItem } from '../userStorageItems/getCurrentUserStorageItem';
import { stepsForRole, type FirstStepId, type FirstStepMark, type FirstStepsRole } from './model';
import { trackFirstStepsStepResolved } from './analytics';
import { resolveInviteDoneImport } from './inviteGate';
import { reconcileFirstSteps } from './reconcileFirstSteps';
import {
  FIRST_STEPS_INTRO_STORAGE_KEYS,
  firstStepStageStorageKey,
  introRemoteFromQuery,
  remoteStageFromQuery,
  type RemoteStage,
} from './stageDocument';
import { saveFirstStepStage, saveFirstStepsIntro } from './syncStage';
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
  const stepIds = stepsForRole(role);
  const [marks, setMarks] = useState<Record<FirstStepId, FirstStepMark>>(() =>
    readFirstStepMarks(storage, userId, role),
  );
  const [introSeen, setIntroSeen] = useState(() => readIntroSeen(storage, userId, role));

  const stageQueries = useQueries({
    queries: stepIds.map((step) => {
      const key = firstStepStageStorageKey(role, step);
      return {
        queryKey: userStorageItemsQueryKeys.current(userId, key),
        queryFn: () => getCurrentUserStorageItem(key),
      };
    }),
  });

  const introKey = FIRST_STEPS_INTRO_STORAGE_KEYS[role];
  const introQuery = useQuery({
    queryKey: userStorageItemsQueryKeys.current(userId, introKey),
    queryFn: () => getCurrentUserStorageItem(introKey),
  });

  const settled =
    introQuery.isSuccess || introQuery.isError
      ? stageQueries.every((query) => query.isSuccess || query.isError)
      : false;
  const remoteSignature = [
    introQuery.isSuccess ? JSON.stringify(introQuery.data ?? null) : introQuery.isError ? 'e' : 'x',
    ...stageQueries.map((query) =>
      query.isSuccess ? JSON.stringify(query.data ?? null) : query.isError ? 'e' : 'x',
    ),
  ].join('|');

  const stageQueriesRef = useRef(stageQueries);
  const introQueryRef = useRef(introQuery);
  stageQueriesRef.current = stageQueries;
  introQueryRef.current = introQuery;

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

      const remoteStages: Partial<Record<FirstStepId, RemoteStage>> = {};
      stepIds.forEach((step, index) => {
        const query = stageQueriesRef.current[index];
        if (!query) return;
        remoteStages[step] = remoteStageFromQuery(
          query.isError ? 'error' : query.isSuccess ? 'success' : 'pending',
          query.data,
        );
      });

      const intro = introQueryRef.current;
      await reconcileFirstSteps({
        storage,
        userId,
        role,
        remoteStages,
        remoteIntro: introRemoteFromQuery(
          intro.isError ? 'error' : intro.isSuccess ? 'success' : 'pending',
          intro.data,
        ),
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
  }, [introSeen, publish, queryClient, role, settled, remoteSignature, stepIds, storage, userId]);

  const remember = useCallback(
    (step: FirstStepId, mark: Exclude<FirstStepMark, 'pending'>, source: 'skip' | 'auto') => {
      const changed = commitFirstStep(storage, userId, role, step, mark, true);
      if (!changed) return;
      if (analytics) trackFirstStepsStepResolved(role, step, mark, source);
      publish();
      void saveFirstStepStage(queryClient, storage, userId, role, step, mark);
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
    void saveFirstStepsIntro(queryClient, userId, role);
  }, [queryClient, role, storage, userId]);

  return {
    marks,
    introSeen,
    startGuide,
    markDone,
    markSkipped,
  };
};
