import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  playIncomingNotificationSound,
  registerNotificationSoundPlayer,
} from '../notificationSound';

describe('notificationSound', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('не падает, если плеер не зарегистрирован', () => {
    expect(() => playIncomingNotificationSound()).not.toThrow();
  });

  it('вызывает один плеер даже при нескольких регистрациях', () => {
    const first = vi.fn();
    const second = vi.fn();
    const unregisterFirst = registerNotificationSoundPlayer(first);
    const unregisterSecond = registerNotificationSoundPlayer(second);

    playIncomingNotificationSound();

    expect(first.mock.calls.length + second.mock.calls.length).toBe(1);

    unregisterFirst();
    unregisterSecond();
  });

  it('после снятия регистрации не вызывает плеер', () => {
    const play = vi.fn();
    const unregister = registerNotificationSoundPlayer(play);
    unregister();

    playIncomingNotificationSound();

    expect(play).not.toHaveBeenCalled();
  });
});
