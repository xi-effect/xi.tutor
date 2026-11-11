import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS } from '../events';
import {
  getTaskReportCommentLengthBucket,
  mapTaskReportFailure,
  trackTaskReportFailed,
  trackTaskReportOpened,
  trackTaskReportSubmitted,
} from '../taskReport';

vi.mock('../umami', () => ({
  trackProductEvent: vi.fn(),
}));

import { trackProductEvent } from '../umami';

const trackMock = vi.mocked(trackProductEvent);

afterEach(() => {
  trackMock.mockClear();
});

const context = {
  taskId: 'ru-ru-00042',
  subject: 'russian',
  grade: 9,
  topicId: 'punctuation',
  taskType: 'fill_blank',
  source: 'page',
};

describe('task report analytics', () => {
  it('открытие передаёт задание и предмет без текста', () => {
    trackTaskReportOpened(context);

    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith(PRODUCT_ANALYTICS_EVENTS.TASK_REPORT_OPENED, {
      event_version: 1,
      task_id: 'ru-ru-00042',
      subject: 'russian',
      grade: 9,
      topic_id: 'punctuation',
      task_type: 'fill_blank',
      source: 'page',
    });
  });

  it('успешная отправка кладёт бакет длины и не кладёт текст', () => {
    const comment = '  ошибка в ответе, подробности на tutor@mail.ru  ';
    trackTaskReportSubmitted(context, comment);

    const payload = trackMock.mock.calls[0]?.[1];
    expect(trackMock).toHaveBeenCalledWith(PRODUCT_ANALYTICS_EVENTS.TASK_REPORT_SUBMITTED, {
      event_version: 1,
      task_id: 'ru-ru-00042',
      subject: 'russian',
      grade: 9,
      topic_id: 'punctuation',
      task_type: 'fill_blank',
      source: 'page',
      has_comment: true,
      comment_length_bucket: '1_50',
    });
    expect(JSON.stringify(payload)).not.toContain('ошибка');
    expect(JSON.stringify(payload)).not.toContain('tutor@mail.ru');
    expect(payload).not.toHaveProperty('comment');
    expect(payload).not.toHaveProperty('message');
    expect(payload).not.toHaveProperty('raw_text');
  });

  it('без текста не добавляет бакет', () => {
    trackTaskReportSubmitted({ taskId: 'task-1', subject: 'mathematics', grade: 8 }, '   ');

    expect(trackMock).toHaveBeenCalledWith(PRODUCT_ANALYTICS_EVENTS.TASK_REPORT_SUBMITTED, {
      event_version: 1,
      task_id: 'task-1',
      subject: 'mathematics',
      grade: 8,
      has_comment: false,
    });
  });

  it('режет длину по границам бакетов', () => {
    expect(getTaskReportCommentLengthBucket(0)).toBeUndefined();
    expect(getTaskReportCommentLengthBucket(1)).toBe('1_50');
    expect(getTaskReportCommentLengthBucket(50)).toBe('1_50');
    expect(getTaskReportCommentLengthBucket(51)).toBe('51_150');
    expect(getTaskReportCommentLengthBucket(150)).toBe('51_150');
    expect(getTaskReportCommentLengthBucket(151)).toBe('151_300');
    expect(getTaskReportCommentLengthBucket(300)).toBe('151_300');
    expect(getTaskReportCommentLengthBucket(301)).toBe('300_plus');
  });

  it('ошибка отправки не содержит сырой текст ошибки', () => {
    const reason = mapTaskReportFailure({
      response: { status: 500, data: { detail: 'internal: секретный текст репорта' } },
      message: 'секретный текст репорта',
    });

    trackTaskReportFailed(context, reason);

    const payload = trackMock.mock.calls[0]?.[1];
    expect(payload).toEqual({
      event_version: 1,
      task_id: 'ru-ru-00042',
      subject: 'russian',
      reason: 'server_error',
    });
    expect(JSON.stringify(payload)).not.toContain('секретный');
  });

  it('классифицирует причину ошибки', () => {
    expect(mapTaskReportFailure({ code: 'ERR_NETWORK', message: 'Network Error' })).toBe(
      'network_error',
    );
    expect(mapTaskReportFailure(new TypeError('Failed to fetch'))).toBe('network_error');
    expect(mapTaskReportFailure({ response: { status: 422, data: { detail: 'too long' } } })).toBe(
      'validation_error',
    );
    expect(mapTaskReportFailure({ response: { status: 400 } })).toBe('validation_error');
    expect(mapTaskReportFailure({ status: 503 })).toBe('server_error');
    expect(mapTaskReportFailure(new Error('что-то сломалось'))).toBe('unknown');
    expect(mapTaskReportFailure(null)).toBe('unknown');
  });
});
