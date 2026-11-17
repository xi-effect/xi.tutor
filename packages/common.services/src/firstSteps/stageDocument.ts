import {
  isStepForRole,
  STUDENT_FIRST_STEPS,
  TUTOR_FIRST_STEPS,
  type FirstStepId,
  type FirstStepMark,
  type FirstStepsRole,
  type StudentFirstStepId,
  type TutorFirstStepId,
} from './model';

/**
 * Версия документа этапа. Новую версию добавляем в `readFirstStepStageDocument`
 * и приводим к полям, которые понимает текущий UI.
 */
export const FIRST_STEPS_STORAGE_VERSION = 'v1' as const;

export const FIRST_STEPS_STORAGE_VERSION_MAX_LENGTH = 16;
export const FIRST_STEP_STATUS_MAX_LENGTH = 16;

/** Наш документ нарочно маленький: в ключе можно хранить до 64 KiB. */
export const FIRST_STEP_DOCUMENT_MAX_BYTES = 512;

/**
 * Один ключ на этап. Не собираются из индекса: бэкенд и массовые операции
 * видят стабильный список.
 */
const TUTOR_FIRST_STEP_STORAGE_KEYS = {
  navigation: 'first-step-tutor-navigation',
  cabinet: 'first-step-tutor-cabinet',
  call: 'first-step-tutor-call',
  invite: 'first-step-tutor-invite',
  material: 'first-step-tutor-material',
} as const satisfies Record<TutorFirstStepId, string>;

const STUDENT_FIRST_STEP_STORAGE_KEYS = {
  join: 'first-step-student-join',
  classroom: 'first-step-student-classroom',
  schedule: 'first-step-student-schedule',
} as const satisfies Record<StudentFirstStepId, string>;

export const FIRST_STEPS_INTRO_STORAGE_KEYS = {
  tutor: 'first-steps-tutor-intro',
  student: 'first-steps-student-intro',
} as const satisfies Record<FirstStepsRole, string>;

export const FIRST_STEPS_STORAGE_ITEM_KEYS = [
  ...Object.values(TUTOR_FIRST_STEP_STORAGE_KEYS),
  ...Object.values(STUDENT_FIRST_STEP_STORAGE_KEYS),
  FIRST_STEPS_INTRO_STORAGE_KEYS.tutor,
  FIRST_STEPS_INTRO_STORAGE_KEYS.student,
] as const;

const STORAGE_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type FirstStepStageDocument = {
  version: typeof FIRST_STEPS_STORAGE_VERSION;
  status: 'done' | 'skipped';
};

export type FirstStepsIntroDocument = {
  version: typeof FIRST_STEPS_STORAGE_VERSION;
  seen: true;
};

export type FirstStepStageRead =
  { kind: 'empty' } | { kind: 'unknown' } | { kind: 'ready'; status: 'done' | 'skipped' };

export type RemoteStage = 'missing' | 'done' | 'skipped' | 'unknown';
export type IntroRemote = 'missing' | 'seen' | 'unknown';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const documentBytes = (document: FirstStepStageDocument | FirstStepsIntroDocument): number =>
  new TextEncoder().encode(JSON.stringify(document)).length;

const assertFirstStepDocumentSize = (
  document: FirstStepStageDocument | FirstStepsIntroDocument,
): void => {
  if (documentBytes(document) > FIRST_STEP_DOCUMENT_MAX_BYTES) {
    throw new Error('Документ этапа первых шагов слишком большой');
  }
};

export const firstStepStageStorageKey = (role: FirstStepsRole, step: FirstStepId): string => {
  if (!isStepForRole(role, step)) {
    throw new Error(`Нет ключа этапа ${step} для роли ${role}`);
  }

  if (role === 'tutor') {
    return TUTOR_FIRST_STEP_STORAGE_KEYS[step as TutorFirstStepId];
  }

  return STUDENT_FIRST_STEP_STORAGE_KEYS[step as StudentFirstStepId];
};

export const isFirstStepStorageKey = (key: string): boolean => STORAGE_KEY_PATTERN.test(key);

export const createFirstStepStageDocument = (
  status: 'done' | 'skipped',
): FirstStepStageDocument => {
  const document: FirstStepStageDocument = {
    version: FIRST_STEPS_STORAGE_VERSION,
    status,
  };
  assertFirstStepDocumentSize(document);
  return document;
};

export const createFirstStepsIntroDocument = (): FirstStepsIntroDocument => {
  const document: FirstStepsIntroDocument = {
    version: FIRST_STEPS_STORAGE_VERSION,
    seen: true,
  };
  assertFirstStepDocumentSize(document);
  return document;
};

const parseV1Status = (value: Record<string, unknown>): FirstStepStageRead => {
  const status = value.status;
  if (typeof status !== 'string' || status.length > FIRST_STEP_STATUS_MAX_LENGTH) {
    return { kind: 'unknown' };
  }

  if (status === 'done' || status === 'skipped') return { kind: 'ready', status };
  return { kind: 'unknown' };
};

/** Неизвестную версию не затираем: фронт ещё не умеет её мигрировать. */
export const readFirstStepStageDocument = (value: unknown): FirstStepStageRead => {
  if (value == null) return { kind: 'empty' };
  if (!isRecord(value)) return { kind: 'unknown' };

  const version = value.version;
  if (typeof version !== 'string' || version.length > FIRST_STEPS_STORAGE_VERSION_MAX_LENGTH) {
    return { kind: 'unknown' };
  }

  switch (version) {
    case FIRST_STEPS_STORAGE_VERSION:
      return parseV1Status(value);
    default:
      return { kind: 'unknown' };
  }
};

export const readFirstStepsIntroDocument = (value: unknown): IntroRemote => {
  if (value == null) return 'missing';
  if (!isRecord(value)) return 'unknown';

  const version = value.version;
  if (typeof version !== 'string' || version.length > FIRST_STEPS_STORAGE_VERSION_MAX_LENGTH) {
    return 'unknown';
  }

  if (version !== FIRST_STEPS_STORAGE_VERSION || value.seen !== true) return 'unknown';
  return 'seen';
};

export const remoteStageFromQuery = (
  status: 'pending' | 'error' | 'success',
  value: unknown,
): RemoteStage => {
  if (status !== 'success') return 'unknown';

  const read = readFirstStepStageDocument(value);
  if (read.kind === 'empty') return 'missing';
  if (read.kind === 'unknown') return 'unknown';
  return read.status;
};

export const introRemoteFromQuery = (
  status: 'pending' | 'error' | 'success',
  value: unknown,
): IntroRemote => {
  if (status !== 'success') return 'unknown';
  return readFirstStepsIntroDocument(value);
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

export const everyFirstStepHasStorageKey = (role: FirstStepsRole): boolean => {
  const steps = role === 'tutor' ? TUTOR_FIRST_STEPS : STUDENT_FIRST_STEPS;
  return steps.every((step) => {
    const key = firstStepStageStorageKey(role, step);
    return isFirstStepStorageKey(key) && key.length <= 100;
  });
};
