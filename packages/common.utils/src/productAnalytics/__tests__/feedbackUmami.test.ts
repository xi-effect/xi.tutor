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
      source: 'post_lesson',
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
  });
});
