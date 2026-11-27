import { describe, expect, it } from 'vitest';
import { resolvePlayableAudioMime } from '../playableAudioMime';

describe('resolvePlayableAudioMime', () => {
  it('не трогает уже честный audio type', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/wav' });
    expect(await resolvePlayableAudioMime(blob, 'voice.wav')).toBeNull();
  });

  it('переписывает octet-stream у mp3, который Safari иначе не играет', async () => {
    const frame = new Uint8Array([0xff, 0xfb, 0x90, 0x00]);
    const blob = new Blob([frame], { type: 'application/octet-stream' });
    expect(await resolvePlayableAudioMime(blob, 'lesson.bin')).toBe('audio/mpeg');
  });

  it('меняет audio/x-m4a на audio/mp4', async () => {
    const blob = new Blob([new Uint8Array([0, 1, 2, 3])], { type: 'audio/x-m4a' });
    expect(await resolvePlayableAudioMime(blob, 'lesson.m4a')).toBe('audio/mp4');
  });

  it('берёт тип из расширения, если сигнатуру не узнать', async () => {
    const blob = new Blob([new Uint8Array([0, 1, 2, 3])], { type: '' });
    expect(await resolvePlayableAudioMime(blob, 'lesson.ogg')).toBe('audio/ogg');
  });
});
