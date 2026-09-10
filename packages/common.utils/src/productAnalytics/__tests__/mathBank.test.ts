import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS } from '../events';
import {
  resetMathBankAnalyticsSession,
  toMathBankSearchProps,
  trackMathBankOpen,
  trackMathTaskInsertBoard,
  trackMathTaskReport,
} from '../mathBank';

vi.mock('../umami', () => ({
  trackProductEvent: vi.fn(),
}));

import { trackProductEvent } from '../umami';

const trackMock = vi.mocked(trackProductEvent);

const memoryStore = new Map<string, string>();

const sessionStorageMock = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memoryStore.set(key, value);
  },
  removeItem: (key: string) => {
    memoryStore.delete(key);
  },
};

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
  configurable: true,
});

afterEach(() => {
  memoryStore.clear();
  resetMathBankAnalyticsSession();
  trackMock.mockClear();
  vi.useRealTimers();
});

const emptyFilters = {
  search: '',
  grades: [] as number[],
  topics: [] as string[],
  difficultyGroups: [] as string[],
  exam: null,
  examTaskNumbers: [] as number[],
  taskTypes: [] as string[],
  favoritesOnly: false,
};

describe('toMathBankSearchProps', () => {
  it('не кладёт текст запроса, только длину и флаги фильтров', () => {
    expect(
      toMathBankSearchProps(
        {
          ...emptyFilters,
          search: ' производная максимум ',
          grades: [11],
          topics: ['algebra.derivatives'],
          exam: 'EGE_PROFILE',
        },
        'page',
      ),
    ).toEqual({
      source: 'page',
      query_length: 20,
      has_query: true,
      has_filters: true,
      grades_count: 1,
      topics_count: 1,
      difficulty_count: 0,
      exam: 'EGE_PROFILE',
      exam_numbers_count: 0,
      types_count: 0,
      favorites_only: false,
    });
  });
});

describe('math bank session', () => {
  it('считает time_to_insert_ms от последнего math_bank_open', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-10T12:00:00Z'));

    trackMathBankOpen('board');
    vi.setSystemTime(new Date('2026-09-10T12:00:04Z'));
    trackMathTaskInsertBoard(
      { id: 'task-1', grade: 9, topicId: 'algebra.linear', taskType: 'equation', difficulty: 2 },
      'board',
    );

    expect(trackMock).toHaveBeenNthCalledWith(1, PRODUCT_ANALYTICS_EVENTS.MATH_BANK_OPEN, {
      event_version: 1,
      source: 'board',
      session_id: expect.any(String),
    });
    expect(trackMock).toHaveBeenNthCalledWith(2, PRODUCT_ANALYTICS_EVENTS.MATH_TASK_INSERT_BOARD, {
      event_version: 1,
      source: 'board',
      task_id: 'task-1',
      grade: 9,
      topic_id: 'algebra.linear',
      task_type: 'equation',
      difficulty: 2,
      session_id: expect.any(String),
      time_to_insert_ms: 4000,
    });
    const openPayload = trackMock.mock.calls[0]?.[1] as { session_id: string };
    const insertPayload = trackMock.mock.calls[1]?.[1] as { session_id: string };
    expect(openPayload.session_id).toBe(insertPayload.session_id);
  });

  it('не шлёт math_task_report без комментария', () => {
    trackMathBankOpen('page');
    expect(trackMathTaskReport({ id: 'task-1', grade: 8 }, '   ', 'page')).toBe(false);
    expect(trackMock).toHaveBeenCalledTimes(1);
  });
});
