import { afterEach, describe, expect, it } from 'vitest';
import { pickFeedbackType } from '../feedbackType';
import { prepareFeedbackComment, maskFeedbackPii } from '../feedbackComment';
import {
  beginCallFeedbackSession,
  computeNextFeedbackEligibleAt,
  debugQueuePostLessonFeedback,
  flushBoardFeedbackUsage,
  flushCallFeedbackUsage,
  getPostLessonFeedbackSession,
  isPostLessonFeedbackCooldownActive,
  markBoardFeedbackEligible,
  markCallFeedbackEligible,
  noteBoardFeedbackActivity,
  POST_LESSON_FEEDBACK_JITTER_MS,
  POST_LESSON_FEEDBACK_MIN_COOLDOWN_MS,
  readPostLessonFeedbackPersisted,
  resetPostLessonFeedbackState,
  startCallFeedbackUsage,
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
    expect(pickFeedbackType({ callEligible: true, boardEligible: true }, 'call')).toBe('board');
    expect(pickFeedbackType({ callEligible: true, boardEligible: true }, 'board')).toBe('call');
  });

  it('если прошлого типа нет, выбирает случайно', () => {
    expect(pickFeedbackType({ callEligible: true, boardEligible: true }, null, () => 0.1)).toBe(
      'call',
    );
    expect(pickFeedbackType({ callEligible: true, boardEligible: true }, null, () => 0.9)).toBe(
      'board',
    );
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

describe('computeNextFeedbackEligibleAt', () => {
  it('даёт 6 дней плюс jitter до суток', () => {
    const shownAt = 1_000_000;
    expect(computeNextFeedbackEligibleAt(shownAt, () => 0)).toBe(
      shownAt + POST_LESSON_FEEDBACK_MIN_COOLDOWN_MS,
    );
    expect(computeNextFeedbackEligibleAt(shownAt, () => 0.999999)).toBeGreaterThan(
      shownAt + POST_LESSON_FEEDBACK_MIN_COOLDOWN_MS,
    );
    expect(computeNextFeedbackEligibleAt(shownAt, () => 0.999999)).toBeLessThan(
      shownAt + POST_LESSON_FEEDBACK_MIN_COOLDOWN_MS + POST_LESSON_FEEDBACK_JITTER_MS,
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

    const persisted = readPostLessonFeedbackPersisted(1);
    expect(persisted.nextEligibleAt).toBeGreaterThan(persisted.lastPromptAt);
    expect(isPostLessonFeedbackCooldownActive(1)).toBe(true);

    resetPostLessonFeedbackState();
    markCallFeedbackEligible();
    expect(tryQueuePostLessonFeedback(1)).toBeNull();
  });

  it('чередует тип относительно прошлого показа', () => {
    const storage = memoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };

    writePostLessonFeedbackPersisted(2, {
      lastPromptAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      nextEligibleAt: Date.now() - 60_000,
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
      nextEligibleAt: Date.now() + POST_LESSON_FEEDBACK_MIN_COOLDOWN_MS,
      lastType: 'call',
    });

    expect(debugQueuePostLessonFeedback('board')).toBe('board');
    expect(getPostLessonFeedbackSession().pendingType).toBe('board');
    expect(getPostLessonFeedbackSession().promptShown).toBe(false);
    expect(readPostLessonFeedbackPersisted(4).lastPromptAt).toBeGreaterThan(0);
  });

  it('новый звонок не сбрасывает уже показанный prompt и не затирает callEligible', () => {
    const storage = memoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };

    markBoardFeedbackEligible();
    expect(tryQueuePostLessonFeedback(3)).toBe('board');
    beginCallFeedbackSession();
    expect(getPostLessonFeedbackSession().pendingType).toBe('board');
    expect(getPostLessonFeedbackSession().promptShown).toBe(true);
  });

  it('reconnect звонка сохраняет уже заработанный callEligible', () => {
    const storage = memoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };

    markCallFeedbackEligible();
    markBoardFeedbackEligible();
    beginCallFeedbackSession();
    expect(getPostLessonFeedbackSession().callEligible).toBe(true);
    expect(getPostLessonFeedbackSession().boardEligible).toBe(true);
    expect(tryQueuePostLessonFeedback(5)).toBeTruthy();
  });
});

describe('feedback usage eligibility', () => {
  afterEach(() => {
    resetPostLessonFeedbackState();
  });

  const withStorage = () => {
    const storage = memoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };
    return storage;
  };

  const simulateBoardActive = (startMs: number, durationMs: number, stepMs = 30_000) => {
    noteBoardFeedbackActivity(startMs);
    for (let at = startMs + stepMs; at <= startMs + durationMs; at += stepMs) {
      noteBoardFeedbackActivity(at);
    }
  };

  it('Call 45 мин, board 0 → call и корзина 45_60m', () => {
    withStorage();
    startCallFeedbackUsage(0);
    flushCallFeedbackUsage(45 * 60_000);

    expect(tryQueuePostLessonFeedback(10, 45 * 60_000)).toBe('call');
    const session = getPostLessonFeedbackSession();
    expect(session.pendingEligibility).toBe('call_only');
    expect(session.pendingUsageDurationBucket).toBe('45_60m');
  });

  it('Call 5 мин, board active 25 мин → board', () => {
    withStorage();
    startCallFeedbackUsage(0);
    flushCallFeedbackUsage(5 * 60_000);

    simulateBoardActive(0, 25 * 60_000);

    expect(tryQueuePostLessonFeedback(11, 25 * 60_000)).toBe('board');
    const session = getPostLessonFeedbackSession();
    expect(session.callEligible).toBe(false);
    expect(session.pendingEligibility).toBe('board_only');
    expect(session.pendingUsageDurationBucket).toBe('15_30m');
  });

  it('Call 50 мин, board active 35 мин → eligible both, показывается один тип', () => {
    withStorage();
    startCallFeedbackUsage(0);
    flushCallFeedbackUsage(50 * 60_000);

    simulateBoardActive(0, 35 * 60_000);

    writePostLessonFeedbackPersisted(12, {
      lastPromptAt: 1,
      nextEligibleAt: 1,
      lastType: 'call',
    });

    expect(tryQueuePostLessonFeedback(12, 50 * 60_000)).toBe('board');
    const session = getPostLessonFeedbackSession();
    expect(session.pendingEligibility).toBe('both');
    expect(session.pendingUsageDurationBucket).toBe('30_45m');
  });

  it('Call 10 мин, board active 14 мин → feedback не показывается', () => {
    withStorage();
    startCallFeedbackUsage(0);
    flushCallFeedbackUsage(10 * 60_000);

    simulateBoardActive(0, 14 * 60_000);

    expect(tryQueuePostLessonFeedback(13, 14 * 60_000)).toBeNull();
    expect(getPostLessonFeedbackSession().pendingType).toBeNull();
  });

  it('Board открыта 60 мин, активность только 6 мин → board feedback не показывается', () => {
    withStorage();
    simulateBoardActive(0, 6 * 60_000);
    flushBoardFeedbackUsage(60 * 60_000);

    expect(getPostLessonFeedbackSession().boardActiveMs).toBe(6 * 60_000);
    expect(tryQueuePostLessonFeedback(14, 60 * 60_000)).toBeNull();
  });

  it('Call 8 мин + reconnect + 10 мин → 18 мин → call eligible', () => {
    withStorage();
    startCallFeedbackUsage(0);
    flushCallFeedbackUsage(8 * 60_000);
    startCallFeedbackUsage(9 * 60_000);
    flushCallFeedbackUsage(19 * 60_000);

    expect(getPostLessonFeedbackSession().callConnectedMs).toBe(18 * 60_000);
    expect(tryQueuePostLessonFeedback(15, 19 * 60_000)).toBe('call');
    expect(getPostLessonFeedbackSession().pendingEligibility).toBe('call_only');
    expect(getPostLessonFeedbackSession().pendingUsageDurationBucket).toBe('15_30m');
  });

  it('не считает connected-время до старта и после disconnect', () => {
    withStorage();
    flushCallFeedbackUsage(10 * 60_000);
    startCallFeedbackUsage(10 * 60_000);
    flushCallFeedbackUsage(20 * 60_000);

    expect(getPostLessonFeedbackSession().callConnectedMs).toBe(10 * 60_000);
    expect(tryQueuePostLessonFeedback(16, 40 * 60_000)).toBeNull();
  });

  it('idle > 2 минут между действиями на доске не суммируется', () => {
    withStorage();
    noteBoardFeedbackActivity(0);
    noteBoardFeedbackActivity(3 * 60_000);
    noteBoardFeedbackActivity(6 * 60_000);
    noteBoardFeedbackActivity(20 * 60_000);

    expect(getPostLessonFeedbackSession().boardActiveMs).toBe(0);
    expect(tryQueuePostLessonFeedback(17, 20 * 60_000)).toBeNull();
  });

  it('reconnect звонка сохраняет накопленное connected-время', () => {
    withStorage();
    startCallFeedbackUsage(0);
    flushCallFeedbackUsage(16 * 60_000);
    beginCallFeedbackSession();
    startCallFeedbackUsage(20 * 60_000);
    flushCallFeedbackUsage(22 * 60_000);

    expect(getPostLessonFeedbackSession().callConnectedMs).toBe(18 * 60_000);
    expect(getPostLessonFeedbackSession().callEligible).toBe(true);
  });
});
