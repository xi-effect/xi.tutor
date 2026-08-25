import { describe, expect, it, vi } from 'vitest';
import { resolveAudioOutputSinkId, setAudioOutputSink } from '../setAudioOutputSink';

describe('resolveAudioOutputSinkId', () => {
  it('подставляет default для пустого значения', () => {
    expect(resolveAudioOutputSinkId(undefined)).toBe('default');
    expect(resolveAudioOutputSinkId(null)).toBe('default');
    expect(resolveAudioOutputSinkId('')).toBe('default');
    expect(resolveAudioOutputSinkId('default')).toBe('default');
  });

  it('сохраняет выбранный deviceId', () => {
    expect(resolveAudioOutputSinkId('headphones-id')).toBe('headphones-id');
  });
});

describe('setAudioOutputSink', () => {
  it('вызывает setSinkId, если API есть', async () => {
    const setSinkId = vi.fn().mockResolvedValue(undefined);
    const audio = { setSinkId } as unknown as HTMLAudioElement;

    setAudioOutputSink(audio, 'sink-1');

    expect(setSinkId).toHaveBeenCalledWith('sink-1');
  });

  it('не падает, если setSinkId нет', () => {
    const audio = {} as HTMLAudioElement;
    expect(() => setAudioOutputSink(audio, 'sink-1')).not.toThrow();
  });
});
