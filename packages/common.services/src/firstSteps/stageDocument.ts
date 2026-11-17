import { stepsForRole, type FirstStepId, type FirstStepMark, type FirstStepsRole } from './model';

/**
 * Версия документа прогресса. Новую версию добавляем в `readFirstStepsProgressDocument`
 * и приводим к полям, которые понимает текущий UI.
 */
export const FIRST_STEPS_STORAGE_VERSION = 'v1' as const;

export const FIRST_STEPS_STORAGE_VERSION_MAX_LENGTH = 16;
export const FIRST_STEP_STATUS_MAX_LENGTH = 16;

/** Весь прогресс роли умещается в один маленький документ. В ключе можно хранить до 64 KiB. */
export const FIRST_STEP_DOCUMENT_MAX_BYTES = 2048;

/** Один ключ на роль: приветствие и все пункты гайда лежат в одном JSON. */
export const FIRST_STEPS_PROGRESS_STORAGE_KEYS = {
  tutor: 'first-steps-tutor',
  student: 'first-steps-student',
} as const satisfies Record<FirstStepsRole, string>;

export const FIRST_STEPS_STORAGE_ITEM_KEYS = [
  FIRST_STEPS_PROGRESS_STORAGE_KEYS.tutor,
  FIRST_STEPS_PROGRESS_STORAGE_KEYS.student,
] as const;

const STORAGE_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type FirstStepsProgressDocument = {
  version: typeof FIRST_STEPS_STORAGE_VERSION;
  introSeen?: true;
  /** Кабинет уже создан или пользователь его удалил. Только у репетитора. */
  demoCabinetInitialized?: true;
  steps?: Partial<Record<FirstStepId, 'done' | 'skipped'>>;
};

export type RemoteStage = 'missing' | 'done' | 'skipped' | 'unknown';
export type IntroRemote = 'missing' | 'seen' | 'unknown';

export type FirstStepsProgressRead =
  | { kind: 'empty' }
  | { kind: 'unknown' }
  | {
      kind: 'ready';
      intro: IntroRemote;
      demoCabinetInitialized: boolean | 'unknown';
      stages: Partial<Record<FirstStepId, RemoteStage>>;
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const documentBytes = (document: FirstStepsProgressDocument): number =>
  new TextEncoder().encode(JSON.stringify(document)).length;

const assertFirstStepDocumentSize = (document: FirstStepsProgressDocument): void => {
  if (documentBytes(document) > FIRST_STEP_DOCUMENT_MAX_BYTES) {
    throw new Error('Документ первых шагов слишком большой');
  }
};

export const firstStepsProgressStorageKey = (role: FirstStepsRole): string =>
  FIRST_STEPS_PROGRESS_STORAGE_KEYS[role];

export const isFirstStepStorageKey = (key: string): boolean => STORAGE_KEY_PATTERN.test(key);

export const createFirstStepsProgressDocument = (
  role: FirstStepsRole,
  marks: Record<FirstStepId, FirstStepMark>,
  introSeen: boolean,
  demoCabinetInitialized = false,
): FirstStepsProgressDocument => {
  const steps: Partial<Record<FirstStepId, 'done' | 'skipped'>> = {};
  for (const step of stepsForRole(role)) {
    const mark = marks[step];
    if (mark === 'done' || mark === 'skipped') steps[step] = mark;
  }

  const document: FirstStepsProgressDocument = {
    version: FIRST_STEPS_STORAGE_VERSION,
    ...(introSeen ? { introSeen: true } : {}),
    ...(role === 'tutor' && demoCabinetInitialized ? { demoCabinetInitialized: true } : {}),
    ...(Object.keys(steps).length > 0 ? { steps } : {}),
  };
  assertFirstStepDocumentSize(document);
  return document;
};

const missingStages = (role: FirstStepsRole): Partial<Record<FirstStepId, RemoteStage>> =>
  Object.fromEntries(stepsForRole(role).map((step) => [step, 'missing']));

const unknownStages = (role: FirstStepsRole): Partial<Record<FirstStepId, RemoteStage>> =>
  Object.fromEntries(stepsForRole(role).map((step) => [step, 'unknown']));

/** Неизвестную версию не затираем: фронт ещё не умеет её мигрировать. */
export const readFirstStepsProgressDocument = (
  role: FirstStepsRole,
  value: unknown,
): FirstStepsProgressRead => {
  if (value == null) return { kind: 'empty' };
  if (!isRecord(value)) return { kind: 'unknown' };

  const version = value.version;
  if (typeof version !== 'string' || version.length > FIRST_STEPS_STORAGE_VERSION_MAX_LENGTH) {
    return { kind: 'unknown' };
  }
  if (version !== FIRST_STEPS_STORAGE_VERSION) return { kind: 'unknown' };

  let intro: IntroRemote = 'missing';
  if (value.introSeen === true) intro = 'seen';
  else if (value.introSeen != null) intro = 'unknown';

  const demoCabinetInitialized = readDemoCabinetField(role, value.demoCabinetInitialized);

  if (value.steps == null) {
    return { kind: 'ready', intro, demoCabinetInitialized, stages: missingStages(role) };
  }
  if (!isRecord(value.steps)) return { kind: 'unknown' };

  const stages: Partial<Record<FirstStepId, RemoteStage>> = {};
  for (const step of stepsForRole(role)) {
    if (!(step in value.steps)) {
      stages[step] = 'missing';
      continue;
    }
    const status = value.steps[step];
    if (
      (status === 'done' || status === 'skipped') &&
      status.length <= FIRST_STEP_STATUS_MAX_LENGTH
    ) {
      stages[step] = status;
    } else {
      stages[step] = 'unknown';
    }
  }

  return { kind: 'ready', intro, demoCabinetInitialized, stages };
};

const readDemoCabinetField = (role: FirstStepsRole, value: unknown): boolean | 'unknown' => {
  if (role !== 'tutor' || value == null) return false;
  return value === true ? true : 'unknown';
};

export const progressRemoteFromQuery = (
  role: FirstStepsRole,
  status: 'pending' | 'error' | 'success',
  value: unknown,
): {
  intro: IntroRemote;
  demoCabinet: boolean | 'unknown';
  stages: Partial<Record<FirstStepId, RemoteStage>>;
} => {
  if (status !== 'success') {
    return { intro: 'unknown', demoCabinet: 'unknown', stages: unknownStages(role) };
  }

  const read = readFirstStepsProgressDocument(role, value);
  if (read.kind === 'empty') {
    return { intro: 'missing', demoCabinet: false, stages: missingStages(role) };
  }
  if (read.kind === 'unknown') {
    return { intro: 'unknown', demoCabinet: 'unknown', stages: unknownStages(role) };
  }
  return { intro: read.intro, demoCabinet: read.demoCabinetInitialized, stages: read.stages };
};

export const planFirstStepSync = (input: {
  local: FirstStepMark;
  remote: RemoteStage;
  legacyDone: boolean;
  legacySkipped: boolean;
  dirty: boolean;
  ignoreLegacyDone: boolean;
}): { mark: FirstStepMark; upload: boolean } => {
  if (input.remote === 'unknown') {
    return { mark: input.local, upload: false };
  }

  if (input.dirty && input.local !== 'pending') {
    return { mark: input.local, upload: true };
  }

  if (input.remote === 'done' || input.remote === 'skipped') {
    return { mark: input.remote, upload: false };
  }

  let mark: FirstStepMark = input.local;
  if (input.ignoreLegacyDone && mark === 'done') mark = 'pending';

  const legacyDone = input.ignoreLegacyDone ? false : input.legacyDone;
  if (legacyDone) mark = 'done';
  else if (mark === 'pending' && input.legacySkipped) mark = 'skipped';

  return { mark, upload: mark !== 'pending' };
};

export const planIntroSync = (input: {
  localSeen: boolean;
  remote: IntroRemote;
}): { seen: boolean; upload: boolean } => {
  if (input.remote === 'unknown') return { seen: input.localSeen, upload: false };
  if (input.remote === 'seen') return { seen: true, upload: false };
  return { seen: input.localSeen, upload: input.localSeen };
};
