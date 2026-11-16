import type { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getCurrentUserFlag } from '../userFlags/getCurrentUserFlag';
import { firstStepFlagKey, stepsForRole, type FirstStepId, type FirstStepsRole } from './model';
import { saveFirstStepStage, saveFirstStepsIntro } from './syncStage';
import {
  planFirstStepSync,
  planIntroSync,
  type IntroRemote,
  type RemoteStage,
} from './stageDocument';
import {
  acknowledgeFirstStep,
  dirtyFirstSteps,
  markIntroSeen,
  markLegacyFlagsMerged,
  queueFirstStepUpload,
  readFirstStepMarks,
  readIntroSeen,
  readLegacyFlagsMerged,
  writeRemoteFirstStep,
  type FirstStepsStorage,
} from './storage';

const readFlag = async (key: string): Promise<boolean> => {
  try {
    return await getCurrentUserFlag(key);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return false;
    throw error;
  }
};

const readLegacyFlags = async (
  role: FirstStepsRole,
  steps: readonly FirstStepId[],
): Promise<Partial<Record<FirstStepId, { done: boolean; skipped: boolean }>>> => {
  const entries = await Promise.all(
    steps.map(async (step) => {
      const [done, skipped] = await Promise.all([
        readFlag(firstStepFlagKey(role, step, 'done')),
        readFlag(firstStepFlagKey(role, step, 'skip')),
      ]);
      return [step, { done, skipped }] as const;
    }),
  );

  return Object.fromEntries(entries);
};

export const reconcileFirstSteps = async (input: {
  storage: FirstStepsStorage;
  userId: number;
  role: FirstStepsRole;
  remoteStages: Partial<Record<FirstStepId, RemoteStage>>;
  remoteIntro: IntroRemote;
  ignoreInviteDone: boolean;
  queryClient: QueryClient;
}): Promise<void> => {
  const steps = stepsForRole(input.role);
  const remoteOf = (step: FirstStepId): RemoteStage => input.remoteStages[step] ?? 'missing';
  const dirtyBeforeFetch = new Set(dirtyFirstSteps(input.storage, input.userId, input.role));
  const shouldReadFlags =
    !readLegacyFlagsMerged(input.storage, input.userId, input.role) &&
    steps.some((step) => remoteOf(step) === 'missing' && !dirtyBeforeFetch.has(step));

  let legacy: Partial<Record<FirstStepId, { done: boolean; skipped: boolean }>> = {};
  const serverHasEveryStage = steps.every(
    (step) => remoteOf(step) === 'done' || remoteOf(step) === 'skipped',
  );
  if (shouldReadFlags) {
    try {
      const missingSteps = steps.filter(
        (step) => remoteOf(step) === 'missing' && !dirtyBeforeFetch.has(step),
      );
      legacy = await readLegacyFlags(input.role, missingSteps);
      markLegacyFlagsMerged(input.storage, input.userId, input.role);
    } catch (error) {
      console.error('Не удалось прочитать старые флаги первых шагов', error);
    }
  } else if (
    !readLegacyFlagsMerged(input.storage, input.userId, input.role) &&
    serverHasEveryStage
  ) {
    markLegacyFlagsMerged(input.storage, input.userId, input.role);
  }

  const marks = readFirstStepMarks(input.storage, input.userId, input.role);
  const dirty = new Set(dirtyFirstSteps(input.storage, input.userId, input.role));
  const uploads: Promise<void>[] = [];

  for (const step of steps) {
    const local = marks[step];
    const stepDirty = dirty.has(step);
    const legacyMark = legacy[step];
    const plan = planFirstStepSync({
      local,
      remote: remoteOf(step),
      legacyDone: legacyMark?.done ?? false,
      legacySkipped: legacyMark?.skipped ?? false,
      dirty: stepDirty,
      ignoreLegacyDone: input.ignoreInviteDone && step === 'invite',
    });

    if (!stepDirty && plan.mark !== local) {
      writeRemoteFirstStep(input.storage, input.userId, input.role, step, plan.mark);
    }

    if (stepDirty && local === 'pending') {
      acknowledgeFirstStep(input.storage, input.userId, input.role, step);
    }

    if (plan.upload && (plan.mark === 'done' || plan.mark === 'skipped')) {
      queueFirstStepUpload(input.storage, input.userId, input.role, step);
      uploads.push(
        saveFirstStepStage(
          input.queryClient,
          input.storage,
          input.userId,
          input.role,
          step,
          plan.mark,
        ),
      );
    }
  }

  const introPlan = planIntroSync({
    localSeen: readIntroSeen(input.storage, input.userId, input.role),
    remote: input.remoteIntro,
  });

  if (introPlan.seen) markIntroSeen(input.storage, input.userId, input.role);
  if (introPlan.upload) {
    uploads.push(saveFirstStepsIntro(input.queryClient, input.userId, input.role));
  }

  await Promise.all(uploads);
};
