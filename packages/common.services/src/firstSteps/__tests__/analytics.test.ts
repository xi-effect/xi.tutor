import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS, resetTrackOnceKeys } from 'common.utils';
import {
  trackFirstStepsAction,
  trackFirstStepsFinished,
  trackFirstStepsScreen,
  trackFirstStepsStepResolved,
  trackFirstStepsTour,
} from '../analytics';

describe('first steps analytics', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetTrackOnceKeys();
    delete (globalThis as { window?: unknown }).window;
  });

  const installUmami = () => {
    vi.stubEnv('VITE_ENABLE_PRODUCT_ANALYTICS', 'true');
    const track = vi.fn();
    (globalThis as { window?: Window & { umami?: { track: typeof track } } }).window = {
      umami: { track },
      location: { search: '', pathname: '/' },
    } as Window & { umami?: { track: typeof track } };
    return track;
  };

  it('показывает экран один раз и шлёт действие старта вместе с туториалом', () => {
    const track = installUmami();

    trackFirstStepsScreen('tutor', 'welcome', 0, 6);
    trackFirstStepsScreen('tutor', 'welcome', 1, 6);
    trackFirstStepsAction('tutor', 'start');

    expect(track).toHaveBeenCalledTimes(3);
    expect(track.mock.calls[0]?.[0]).toBe(PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_SCREEN_VIEWED);
    expect(track.mock.calls[0]?.[1]).toMatchObject({
      screen: 'welcome',
      user_role: 'tutor',
      steps_resolved: 0,
      steps_total: 6,
    });
    expect(track.mock.calls[1]?.[0]).toBe(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_TUTORIAL_STARTED);
    expect(track.mock.calls[2]?.[0]).toBe(PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_ACTION);
    expect(track.mock.calls[2]?.[1]).toMatchObject({ action: 'start', user_role: 'tutor' });
  });

  it('отмечает шаг один раз и завершает онбординг по кнопке «Перейти к работе»', () => {
    const track = installUmami();

    trackFirstStepsStepResolved('tutor', 'navigation', 'done', 'tour');
    trackFirstStepsStepResolved('tutor', 'navigation', 'done', 'tour');
    trackFirstStepsTour({
      role: 'tutor',
      step: 'navigation',
      action: 'started',
      anchor: 'sidebar',
    });
    trackFirstStepsTour({
      role: 'tutor',
      step: 'navigation',
      action: 'started',
      anchor: 'sidebar',
    });
    trackFirstStepsTour({
      role: 'tutor',
      step: 'navigation',
      action: 'advanced',
      anchor: 'sidebar',
    });
    trackFirstStepsFinished('tutor', 'tour_done');

    const names = track.mock.calls.map((call) => call[0]);
    expect(
      names.filter((name) => name === PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_STEP_RESOLVED),
    ).toHaveLength(1);
    expect(names.filter((name) => name === PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_TOUR)).toEqual([
      PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_TOUR,
      PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_TOUR,
    ]);
    expect(names).toContain(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED);
    expect(names).toContain(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_TUTORIAL_COMPLETED);
    expect(names).toContain('onboarding-complete');
    expect(names).toContain(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_COMPLETED);
    expect(track.mock.calls.find((call) => call[0] === 'onboarding-complete')?.[1]).toMatchObject({
      layout: 'tutor',
    });
  });

  it('ранний выход шлёт пропуск training, а не завершение туториала', () => {
    const track = installUmami();

    trackFirstStepsFinished('student', 'skipped');

    const names = track.mock.calls.map((call) => call[0]);
    expect(names).toContain(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_SKIPPED);
    expect(names).toContain(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_COMPLETED);
    expect(names).not.toContain(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_TUTORIAL_COMPLETED);
    expect(names).not.toContain('onboarding-complete');
    expect(
      track.mock.calls.find(
        (call) => call[0] === PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_SKIPPED,
      )?.[1],
    ).toMatchObject({ skip_reason: 'later', user_role: 'student' });
  });
});
