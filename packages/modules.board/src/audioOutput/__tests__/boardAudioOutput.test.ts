import { describe, expect, it } from 'vitest';
import {
  getBoardAudioOutputDeviceId,
  notifyBoardAudioOutputDeviceChanged,
  registerBoardAudioOutputDevice,
  subscribeBoardAudioOutputDevice,
} from '../boardAudioOutput';

describe('boardAudioOutput', () => {
  it('отдаёт deviceId из зарегистрированного getter и сбрасывает при unregister', () => {
    const unregister = registerBoardAudioOutputDevice(() => 'headphones');
    expect(getBoardAudioOutputDeviceId()).toBe('headphones');
    unregister();
    expect(getBoardAudioOutputDeviceId()).toBeUndefined();
  });

  it('уведомляет подписчиков при смене устройства', () => {
    let current = 'speakers';
    const unregister = registerBoardAudioOutputDevice(() => current);
    let notified = 0;
    const unsubscribe = subscribeBoardAudioOutputDevice(() => {
      notified += 1;
    });

    current = 'headset';
    notifyBoardAudioOutputDeviceChanged();

    expect(notified).toBe(1);
    expect(getBoardAudioOutputDeviceId()).toBe('headset');
    unsubscribe();
    unregister();
  });
});
