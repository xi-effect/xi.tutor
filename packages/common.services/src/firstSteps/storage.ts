import {
  firstStepFlagKey,
  isStepForRole,
  stepsForRole,
  type FirstStepId,
  type FirstStepMark,
  type FirstStepsRole,
} from './model';

export type FirstStepsStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

type StoredFirstSteps = {
  marks: Partial<Record<string, Exclude<FirstStepMark, 'pending'>>>;
  dirty: string[];
  introSeen: boolean;
};

const emptyStored = (): StoredFirstSteps => ({ marks: {}, dirty: [], introSeen: false });

export const firstStepsStorageKey = (userId: number, role: FirstStepsRole): string =>
  `sovlium.firstSteps.v1.${userId}.${role}`;

const readStored = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): StoredFirstSteps => {
  const raw = storage.getItem(firstStepsStorageKey(userId, role));
  if (!raw) return emptyStored();

  try {
    const parsed = JSON.parse(raw) as Partial<StoredFirstSteps> | null;
    const marks: StoredFirstSteps['marks'] = {};

    if (parsed && typeof parsed === 'object' && parsed.marks && typeof parsed.marks === 'object') {
      for (const [step, value] of Object.entries(parsed.marks)) {
        if (!isStepForRole(role, step)) continue;
        if (value === 'done' || value === 'skipped') marks[step] = value;
      }
    }

    const dirty = Array.isArray(parsed?.dirty)
      ? parsed.dirty.filter((key): key is string => typeof key === 'string')
      : [];

    return { marks, dirty, introSeen: parsed?.introSeen === true };
  } catch {
    return emptyStored();
  }
};

const writeStored = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  stored: StoredFirstSteps,
): void => {
  storage.setItem(firstStepsStorageKey(userId, role), JSON.stringify(stored));
};

export const readFirstStepMarks = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): Record<FirstStepId, FirstStepMark> => {
  const stored = readStored(storage, userId, role);
  const marks = {} as Record<FirstStepId, FirstStepMark>;

  for (const step of stepsForRole(role)) {
    marks[step] = stored.marks[step] ?? 'pending';
  }

  return marks;
};

export const dirtyFirstStepFlags = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): string[] => readStored(storage, userId, role).dirty;

export const acknowledgeFirstStepFlag = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  flagKey: string,
): void => {
  const stored = readStored(storage, userId, role);
  if (!stored.dirty.includes(flagKey)) return;
  writeStored(storage, userId, role, {
    ...stored,
    dirty: stored.dirty.filter((key) => key !== flagKey),
  });
};

export const readIntroSeen = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): boolean => readStored(storage, userId, role).introSeen;

export const markIntroSeen = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): void => {
  const stored = readStored(storage, userId, role);
  if (stored.introSeen) return;
  writeStored(storage, userId, role, { ...stored, introSeen: true });
};

/**
 * Пишет отметку шага. `trackDirty` ставит флаг в очередь на сервер.
 * Уже выполненное не затирается пропуском. Повтор той же отметки — no-op.
 */
export const commitFirstStep = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  step: string,
  mark: Exclude<FirstStepMark, 'pending'>,
  trackDirty: boolean,
): boolean => {
  if (!isStepForRole(role, step)) return false;

  const stored = readStored(storage, userId, role);
  const current = stored.marks[step];

  if (current === 'done') return false;
  if (current === mark) return false;

  stored.marks[step] = mark;

  if (trackDirty) {
    const flagKey = firstStepFlagKey(role, step, mark === 'done' ? 'done' : 'skip');
    if (!stored.dirty.includes(flagKey)) stored.dirty.push(flagKey);
  }

  writeStored(storage, userId, role, stored);
  return true;
};

export const applyRemoteFirstStep = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  step: FirstStepId,
  remote: { done: boolean; skipped: boolean },
): boolean => {
  if (remote.done) return commitFirstStep(storage, userId, role, step, 'done', false);
  if (remote.skipped) return commitFirstStep(storage, userId, role, step, 'skipped', false);
  return false;
};

export const browserFirstStepsStorage = (): FirstStepsStorage => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => undefined,
    };
  }

  return {
    getItem: (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // приватный режим или переполненная квота
      }
    },
  };
};
