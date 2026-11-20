import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS } from '../events';
import { trackProductEvent } from '../umami';

describe('trackProductEvent feedback comment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete (globalThis as { window?: unknown }).window;
  });

  it('пропускает comment только в feedback_submitted и маскирует PII', () => {
    vi.stubEnv('VITE_ENABLE_PRODUCT_ANALYTICS', 'true');
    const track = vi.fn();
    (globalThis as { window?: { umami?: { track: typeof track } } }).window = {
      umami: { track },
    };

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_PROMPT_SHOWN, {
      feedback_type: 'call',
      eligibility: 'call_only',
      usage_duration_bucket: '15_30m',
      source: 'post_lesson',
      event_version: 2,
      comment: 'не должно уйти',
    } as never);

    expect(track.mock.calls[0]?.[1]).not.toHaveProperty('comment');

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, {
      feedback_type: 'call',
      connection_quality: 4,
      stability: 5,
      media_quality: 4,
      source: 'post_lesson',
      comment: '  проблема, пишите on tutor@mail.ru  ',
    });

    expect(track.mock.calls[1]?.[1]).toMatchObject({
      feedback_type: 'call',
      comment: 'проблема, пишите on [email]',
      connection_quality: 4,
    });
    expect(track.mock.calls[1]?.[1]).not.toHaveProperty('user_id');

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_ROLE_SELECTED, {
      role: 'tutor',
      user_role: 'tutor',
      user_id: 15,
    });

    expect(track.mock.calls[2]?.[1]).toMatchObject({
      role: 'tutor',
      user_role: 'tutor',
      user_id: 15,
    });
  });

  it('не пропускает текст репорта в task_report_submitted', () => {
    vi.stubEnv('VITE_ENABLE_PRODUCT_ANALYTICS', 'true');
    const track = vi.fn();
    (globalThis as { window?: { umami?: { track: typeof track } } }).window = {
      umami: { track },
    };

    const comment = 'ошибка в ответе, пишите tutor@mail.ru';
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.TASK_REPORT_SUBMITTED, {
      task_id: 'task-1',
      subject: 'russian',
      grade: 8,
      has_comment: true,
      comment_length_bucket: '1_50',
      comment,
      message: comment,
      raw_text: comment,
    } as never);

    const payload = track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).toMatchObject({
      task_id: 'task-1',
      subject: 'russian',
      grade: 8,
      has_comment: true,
      comment_length_bucket: '1_50',
    });
    expect(payload).not.toHaveProperty('comment');
    expect(payload).not.toHaveProperty('message');
    expect(payload).not.toHaveProperty('raw_text');
    expect(JSON.stringify(payload)).not.toContain('tutor@mail.ru');
    expect(JSON.stringify(payload)).not.toContain('ошибка в ответе');
  });
});
