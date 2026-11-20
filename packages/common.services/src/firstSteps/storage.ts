import {
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
  /** Идентификаторы этапов, которые ещё нужно записать в storage item. */
  dirty: string[];
  introSeen: boolean;
  /** Старые булевы флаги `fs.*` уже перенесены или переносить нечего. */
  legacyFlagsMerged: boolean;
  /** Демонстрационный кабинет уже создан или удалён. Пишется в документ `first-steps-tutor`. */
  demoCabinetInitialized: boolean;
};

const emptyStored = (): StoredFirstSteps => ({
  marks: {},
  dirty: [],
  introSeen: false,
  legacyFlagsMerged: false,
  demoCabinetInitialized: false,
});

/** Чек-лист перечитывает отметки, не дожидаясь перезагрузки страницы. */
export const FIRST_STEPS_PROGRESS_EVENT = 'first-steps-progress';

const notifyFirstStepsProgress = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(FIRST_STEPS_PROGRESS_EVENT));
};

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
      ? parsed.dirty.filter(
          (key): key is FirstStepId => typeof key === 'string' && isStepForRole(role, key),
        )
      : [];

    return {
      marks,
      dirty,
      introSeen: parsed?.introSeen === true,
      legacyFlagsMerged: parsed?.legacyFlagsMerged === true,
      demoCabinetInitialized: parsed?.demoCabinetInitialized === true,
    };
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

export const dirtyFirstSteps = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): string[] => readStored(storage, userId, role).dirty;

export const acknowledgeFirstStep = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  step: string,
): void => {
  const stored = readStored(storage, userId, role);
  if (!stored.dirty.includes(step)) return;
  writeStored(storage, userId, role, {
    ...stored,
    dirty: stored.dirty.filter((key) => key !== step),
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

export const readDemoCabinetInitialized = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): boolean => role === 'tutor' && readStored(storage, userId, role).demoCabinetInitialized;

export const markDemoCabinetInitialized = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): void => {
  if (role !== 'tutor') return;
  const stored = readStored(storage, userId, role);
  if (stored.demoCabinetInitialized) return;
  writeStored(storage, userId, role, { ...stored, demoCabinetInitialized: true });
};

export const readLegacyFlagsMerged = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): boolean => readStored(storage, userId, role).legacyFlagsMerged;

export const markLegacyFlagsMerged = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): void => {
  const stored = readStored(storage, userId, role);
  if (stored.legacyFlagsMerged) return;
  writeStored(storage, userId, role, { ...stored, legacyFlagsMerged: true });
};

/**
 * Пишет отметку шага. `trackDirty` ставит этап в очередь на storage item.
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

  if (trackDirty && !stored.dirty.includes(step)) stored.dirty.push(step);

  writeStored(storage, userId, role, stored);
  notifyFirstStepsProgress();
  return true;
};

/** Снимает отметку «выполнено». Пропуск не трогает. */
export const clearFirstStepDone = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  step: FirstStepId,
): boolean => {
  const stored = readStored(storage, userId, role);
  if (stored.marks[step] !== 'done') return false;

  delete stored.marks[step];
  writeStored(storage, userId, role, {
    ...stored,
    dirty: stored.dirty.filter((key) => key !== step),
  });
  notifyFirstStepsProgress();
  return true;
};

/** Ставит отметку с сервера. Неподтверждённую локальную правку не затирает. */
export const writeRemoteFirstStep = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  step: FirstStepId,
  mark: FirstStepMark,
): boolean => {
  if (!isStepForRole(role, step)) return false;

  const stored = readStored(storage, userId, role);
  if (stored.dirty.includes(step)) return false;

  const current = stored.marks[step];
  if (mark === 'pending') {
    if (current == null) return false;
    delete stored.marks[step];
  } else if (current === mark) {
    return false;
  } else {
    stored.marks[step] = mark;
  }

  writeStored(storage, userId, role, stored);
  notifyFirstStepsProgress();
  return true;
};

export const queueFirstStepUpload = (
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  step: FirstStepId,
): void => {
  const stored = readStored(storage, userId, role);
  const mark = stored.marks[step];
  if (mark !== 'done' && mark !== 'skipped') return;
  if (stored.dirty.includes(step)) return;
  writeStored(storage, userId, role, { ...stored, dirty: [...stored.dirty, step] });
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

/**
 * Локальный кэш и очередь. Между устройствами источник правды — один storage item
 * на роль: приветствие, статусы пунктов и признак демонстрационного кабинета.
 */
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
