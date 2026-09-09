import { afterEach, describe, expect, it } from 'vitest';
import { pickFeedbackType } from '../feedbackType';
import { prepareFeedbackComment, maskFeedbackPii } from '../feedbackComment';
import {
  beginCallFeedbackSession,
  debugQueuePostLessonFeedback,
  getPostLessonFeedbackSession,
  markBoardFeedbackEligible,
  markCallFeedbackEligible,
  readPostLessonFeedbackPersisted,
  resetPostLessonFeedbackState,
  tryQueuePostLessonFeedback,
  writePostLessonFeedbackPersisted,
} from '../postLessonFeedback';

const memoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
};

describe('pickFeedbackType', () => {
  it('возвращает единственный eligible тип', () => {
    expect(pickFeedbackType({ callEligible: true, boardEligible: false }, null)).toBe('call');
    expect(pickFeedbackType({ callEligible: false, boardEligible: true }, 'call')).toBe('board');
    expect(pickFeedbackType({ callEligible: false, boardEligible: false }, null)).toBe(null);
  });

  it('чередует типы, если eligible оба', () => {
    expect(pickFeedbackType({ callEligible: true, boardEligible: true }, null)).toBe('call');
    expect(pickFeedbackType({ callEligible: true, boardEligible: true }, 'call')).toBe('board');
    expect(pickFeedbackType({ callEligible: true, boardEligible: true }, 'board')).toBe('call');
  });
});

describe('prepareFeedbackComment', () => {
  it('trim и отбрасывает пустую строку', () => {
    expect(prepareFeedbackComment('   ')).toBeUndefined();
    expect(prepareFeedbackComment('  ок  ')).toBe('ок');
  });

  it('маскирует email и телефон', () => {
    expect(maskFeedbackPii('напишите example@mail.ru')).toBe('напишите [email]');
    expect(maskFeedbackPii('номер +7 999 123-45-67')).toBe('номер [phone]');
    expect(prepareFeedbackComment('email test@mail.ru и +79991234567')).toBe(
      'email [email] и [phone]',
    );
  });
});

describe('tryQueuePostLessonFeedback', () => {
  afterEach(() => {
    resetPostLessonFeedbackState();
  });

  it('не ставит в очередь без eligibility и не чаще раза за cooldown', () => {
    const storage = memoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };

    expect(tryQueuePostLessonFeedback(1)).toBeNull();

    markCallFeedbackEligible();
    expect(tryQueuePostLessonFeedback(1)).toBe('call');
    expect(getPostLessonFeedbackSession().promptShown).toBe(true);
    expect(tryQueuePostLessonFeedback(1)).toBeNull();

    resetPostLessonFeedbackState();
    markCallFeedbackEligible();
    expect(tryQueuePostLessonFeedback(1)).toBeNull();
  });

  it('чередует тип относительно прошлого показа', () => {
    const storage = memoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };

    writePostLessonFeedbackPersisted(2, {
      lastPromptAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      lastType: 'call',
    });
    markCallFeedbackEligible();
    markBoardFeedbackEligible();
    expect(tryQueuePostLessonFeedback(2)).toBe('board');
  });

  it('debugQueue ставит toast без cooldown и без записи lastPromptAt', () => {
    const storage = memoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };

    writePostLessonFeedbackPersisted(4, {
      lastPromptAt: Date.now(),
      lastType: 'call',
    });

    expect(debugQueuePostLessonFeedback('board')).toBe('board');
    expect(getPostLessonFeedbackSession().pendingType).toBe('board');
    expect(getPostLessonFeedbackSession().promptShown).toBe(false);
    expect(readPostLessonFeedbackPersisted(4).lastPromptAt).toBeGreaterThan(0);
  });

  it('новый звонок не сбрасывает уже показанный prompt', () => {
    const storage = memoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };

    markBoardFeedbackEligible();
    expect(tryQueuePostLessonFeedback(3)).toBe('board');
    beginCallFeedbackSession();
    expect(getPostLessonFeedbackSession().pendingType).toBe('board');
    expect(getPostLessonFeedbackSession().promptShown).toBe(true);
  });
});
