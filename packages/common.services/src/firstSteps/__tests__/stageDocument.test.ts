import { describe, expect, it } from 'vitest';
import { TUTOR_FIRST_STEPS, STUDENT_FIRST_STEPS } from '../model';
import {
  FIRST_STEPS_STORAGE_ITEM_KEYS,
  FIRST_STEP_DOCUMENT_MAX_BYTES,
  createFirstStepStageDocument,
  createFirstStepsIntroDocument,
  everyFirstStepHasStorageKey,
  isFirstStepStorageKey,
  planFirstStepSync,
  planIntroSync,
  readFirstStepStageDocument,
  readFirstStepsIntroDocument,
} from '../stageDocument';

describe('документ этапа первых шагов', () => {
  it('даёт каждому этапу свой kebab-case ключ', () => {
    expect(everyFirstStepHasStorageKey('tutor')).toBe(true);
    expect(everyFirstStepHasStorageKey('student')).toBe(true);
    expect(new Set(FIRST_STEPS_STORAGE_ITEM_KEYS).size).toBe(FIRST_STEPS_STORAGE_ITEM_KEYS.length);
    expect(FIRST_STEPS_STORAGE_ITEM_KEYS).toHaveLength(
      TUTOR_FIRST_STEPS.length + STUDENT_FIRST_STEPS.length + 2,
    );

    for (const key of FIRST_STEPS_STORAGE_ITEM_KEYS) {
      expect(isFirstStepStorageKey(key)).toBe(true);
      expect(key.length).toBeLessThanOrEqual(100);
    }
  });

  it('пишет version v1 и читает только статус done или skipped', () => {
    const document = createFirstStepStageDocument('done');

    expect(document).toEqual({ version: 'v1', status: 'done' });
    expect(readFirstStepStageDocument(document)).toEqual({ kind: 'ready', status: 'done' });
    expect(readFirstStepStageDocument(createFirstStepStageDocument('skipped'))).toEqual({
      kind: 'ready',
      status: 'skipped',
    });
    expect(new TextEncoder().encode(JSON.stringify(document)).length).toBeLessThan(
      FIRST_STEP_DOCUMENT_MAX_BYTES,
    );
  });

  it('пустой ответ считает отсутствием, чужую версию не разбирает', () => {
    expect(readFirstStepStageDocument(null)).toEqual({ kind: 'empty' });
    expect(readFirstStepStageDocument({ version: 'v2', status: 'done' })).toEqual({
      kind: 'unknown',
    });
    expect(readFirstStepStageDocument({ version: 'v1', status: 'later' })).toEqual({
      kind: 'unknown',
    });
    expect(readFirstStepStageDocument({ version: 'v'.repeat(17), status: 'done' })).toEqual({
      kind: 'unknown',
    });
    expect(readFirstStepsIntroDocument(createFirstStepsIntroDocument())).toBe('seen');
    expect(readFirstStepsIntroDocument(null)).toBe('missing');
    expect(readFirstStepsIntroDocument({ version: 'v2', seen: true })).toBe('unknown');
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
