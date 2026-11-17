import { describe, expect, it } from 'vitest';
import {
  FIRST_STEPS_STORAGE_ITEM_KEYS,
  FIRST_STEP_DOCUMENT_MAX_BYTES,
  createFirstStepsProgressDocument,
  isFirstStepStorageKey,
  planFirstStepSync,
  planIntroSync,
  readFirstStepsProgressDocument,
} from '../stageDocument';

const pendingTutor = {
  navigation: 'pending',
  cabinet: 'pending',
  call: 'pending',
  invite: 'pending',
  material: 'pending',
} as const;

describe('документ первых шагов', () => {
  it('хранит прогресс роли в одном kebab-case ключе', () => {
    expect(FIRST_STEPS_STORAGE_ITEM_KEYS).toEqual(['first-steps-tutor', 'first-steps-student']);
    expect(new Set(FIRST_STEPS_STORAGE_ITEM_KEYS).size).toBe(FIRST_STEPS_STORAGE_ITEM_KEYS.length);

    for (const key of FIRST_STEPS_STORAGE_ITEM_KEYS) {
      expect(isFirstStepStorageKey(key)).toBe(true);
      expect(key.length).toBeLessThanOrEqual(100);
    }
  });

  it('пишет version v1, приветствие и только завершённые пункты', () => {
    const document = createFirstStepsProgressDocument(
      'tutor',
      { ...pendingTutor, navigation: 'done', cabinet: 'skipped' },
      true,
    );

    expect(document).toEqual({
      version: 'v1',
      introSeen: true,
      steps: { navigation: 'done', cabinet: 'skipped' },
    });
    expect(readFirstStepsProgressDocument('tutor', document)).toEqual({
      kind: 'ready',
      intro: 'seen',
      demoCabinetInitialized: false,
      stages: {
        navigation: 'done',
        cabinet: 'skipped',
        call: 'missing',
        invite: 'missing',
        material: 'missing',
      },
    });
    expect(new TextEncoder().encode(JSON.stringify(document)).length).toBeLessThan(
      FIRST_STEP_DOCUMENT_MAX_BYTES,
    );
  });

  it('пустой ответ считает отсутствием, чужую версию не разбирает', () => {
    expect(readFirstStepsProgressDocument('tutor', null)).toEqual({ kind: 'empty' });
    expect(
      readFirstStepsProgressDocument('tutor', {
        version: 'v2',
        steps: { navigation: 'done' },
      }),
    ).toEqual({ kind: 'unknown' });
    expect(
      readFirstStepsProgressDocument('tutor', {
        version: 'v'.repeat(17),
        introSeen: true,
      }),
    ).toEqual({ kind: 'unknown' });

    expect(
      readFirstStepsProgressDocument('tutor', {
        version: 'v1',
        steps: { navigation: 'later' },
      }).kind,
    ).toBe('ready');
    const partial = readFirstStepsProgressDocument('tutor', {
      version: 'v1',
      steps: { navigation: 'later' },
    });
    expect(partial.kind === 'ready' && partial.stages.navigation).toBe('unknown');
  });

  it('хранит признак демонстрационного кабинета только у репетитора', () => {
    const document = createFirstStepsProgressDocument('tutor', pendingTutor, false, true);

    expect(document).toEqual({ version: 'v1', demoCabinetInitialized: true });
    expect(readFirstStepsProgressDocument('tutor', document).kind === 'ready').toBe(true);
    const read = readFirstStepsProgressDocument('tutor', document);
    expect(read.kind === 'ready' && read.demoCabinetInitialized).toBe(true);
    expect(
      createFirstStepsProgressDocument(
        'student',
        { join: 'pending', classroom: 'pending', schedule: 'pending' },
        false,
        true,
      ),
    ).toEqual({
      version: 'v1',
    });
    expect(
      readFirstStepsProgressDocument('tutor', { version: 'v1', demoCabinetInitialized: 'yes' }),
    ).toMatchObject({ kind: 'ready', demoCabinetInitialized: 'unknown' });
  });

  it('серверный документ важнее локального кэша, пока правка не в очереди', () => {
    expect(
      planFirstStepSync({
        local: 'pending',
        remote: 'done',
        legacyDone: false,
        legacySkipped: true,
        dirty: false,
        ignoreLegacyDone: false,
      }),
    ).toEqual({ mark: 'done', upload: false });

    expect(
      planFirstStepSync({
        local: 'done',
        remote: 'missing',
        legacyDone: false,
        legacySkipped: false,
        dirty: false,
        ignoreLegacyDone: false,
      }),
    ).toEqual({ mark: 'done', upload: true });

    expect(
      planFirstStepSync({
        local: 'skipped',
        remote: 'done',
        legacyDone: false,
        legacySkipped: false,
        dirty: true,
        ignoreLegacyDone: false,
      }),
    ).toEqual({ mark: 'skipped', upload: true });
  });

  it('старый флаг done переносится, ложное приглашение — нет', () => {
    expect(
      planFirstStepSync({
        local: 'pending',
        remote: 'missing',
        legacyDone: true,
        legacySkipped: true,
        dirty: false,
        ignoreLegacyDone: false,
      }),
    ).toEqual({ mark: 'done', upload: true });

    expect(
      planFirstStepSync({
        local: 'done',
        remote: 'missing',
        legacyDone: true,
        legacySkipped: false,
        dirty: false,
        ignoreLegacyDone: true,
      }),
    ).toEqual({ mark: 'pending', upload: false });

    expect(planIntroSync({ localSeen: true, remote: 'missing' })).toEqual({
      seen: true,
      upload: true,
    });
    expect(planIntroSync({ localSeen: false, remote: 'seen' })).toEqual({
      seen: true,
      upload: false,
    });
    expect(planIntroSync({ localSeen: true, remote: 'unknown' })).toEqual({
      seen: true,
      upload: false,
    });
  });
});
