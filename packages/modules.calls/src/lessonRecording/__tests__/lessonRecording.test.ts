import { describe, expect, it, vi } from 'vitest';
import { ConferenceAudioMixer } from '../audioMixer';
import { sourcesAlongsidePlayback } from '../capture';
import { formatLessonRecordingFilename, formatRecordingClock } from '../filename';
import { selectRecordingMimeType } from '../mime';

describe('formatLessonRecordingFilename', () => {
  it('собирает имя из локальной даты', () => {
    const date = new Date(2026, 9, 2, 16, 30, 45);
    expect(formatLessonRecordingFilename(date, 'webm')).toBe(
      'Sovlium lesson 02.10.2026 16-30.webm',
    );
  });
});

describe('formatRecordingClock', () => {
  it('показывает минуты и секунды', () => {
    expect(formatRecordingClock(12 * 60 + 43)).toBe('12:43');
    expect(formatRecordingClock(0)).toBe('00:00');
  });

  it('добавляет часы на длинном уроке', () => {
    expect(formatRecordingClock(3600 + 62)).toBe('1:01:02');
  });
});

describe('selectRecordingMimeType', () => {
  it('берёт первый поддерживаемый кодек', () => {
    expect(selectRecordingMimeType((mime) => mime === 'video/webm;codecs=vp8,opus').mimeType).toBe(
      'video/webm;codecs=vp8,opus',
    );
  });

  it('переходит на mp4, если webm недоступен', () => {
    const choice = selectRecordingMimeType((mime) => mime === 'video/mp4');
    expect(choice).toEqual({ mimeType: 'video/mp4', format: 'mp4', extension: 'mp4' });
  });
});

describe('ConferenceAudioMixer', () => {
  it('не останавливает исходные треки LiveKit', async () => {
    const disconnect = vi.fn();
    const destinationStop = vi.fn();
    vi.stubGlobal(
      'AudioContext',
      class {
        state = 'running';
        resume() {
          return Promise.resolve();
        }
        close() {
          return Promise.resolve();
        }
        createMediaStreamDestination() {
          return { stream: { getAudioTracks: () => [{ stop: destinationStop }] } };
        }
        createMediaStreamSource() {
          return { connect() {}, disconnect };
        }
        createGain() {
          return {
            gain: { value: 0 },
            connect() {
              return this;
            },
            disconnect() {},
          };
        }
        createConstantSource() {
          return {
            connect() {
              return this;
            },
            disconnect() {},
            start() {},
            stop() {},
          };
        }
      },
    );
    vi.stubGlobal(
      'MediaStream',
      class {
        constructor(public tracks: MediaStreamTrack[]) {}
      },
    );

    const originalStop = vi.fn();
    const track = { readyState: 'live', stop: originalStop } as unknown as MediaStreamTrack;
    const mixer = new ConferenceAudioMixer();
    mixer.sync([{ id: 'tutor:mic', track }]);
    mixer.sync([]);
    await mixer.close();

    expect(originalStop).not.toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
    expect(destinationStop).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('подмешивает звук компьютера и не останавливает его трек', async () => {
    const disconnect = vi.fn();
    vi.stubGlobal(
      'AudioContext',
      class {
        state = 'running';
        resume() {
          return Promise.resolve();
        }
        close() {
          return Promise.resolve();
        }
        createMediaStreamDestination() {
          return { stream: { getAudioTracks: () => [{ stop() {} }] } };
        }
        createMediaStreamSource() {
          return { connect() {}, disconnect };
        }
        createGain() {
          return {
            gain: { value: 0 },
            connect() {
              return this;
            },
            disconnect() {},
          };
        }
        createConstantSource() {
          return {
            connect() {
              return this;
            },
            disconnect() {},
            start() {},
            stop() {},
          };
        }
      },
    );
    vi.stubGlobal(
      'MediaStream',
      class {
        constructor(public tracks: MediaStreamTrack[]) {}
      },
    );

    const originalStop = vi.fn();
    const track = { readyState: 'live', stop: originalStop } as unknown as MediaStreamTrack;
    const mixer = new ConferenceAudioMixer();
    mixer.setPlayback(track);
    mixer.sync([]);
    await mixer.close();

    expect(originalStop).not.toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('sourcesAlongsidePlayback', () => {
  it('оставляет микрофон репетитора, когда звук вкладки уже содержит звонок', () => {
    const sources = [
      { id: 'local', origin: 'local' as const },
      { id: 'remote', origin: 'remote' as const },
    ];
    expect(sourcesAlongsidePlayback(sources, true).map((source) => source.id)).toEqual(['local']);
    expect(sourcesAlongsidePlayback(sources, false)).toEqual(sources);
  });
});
