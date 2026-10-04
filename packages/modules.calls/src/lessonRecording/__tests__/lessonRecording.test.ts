import { describe, expect, it, vi } from 'vitest';
import { ConferenceAudioMixer } from '../audioMixer';
import { sourcesAlongsidePlayback } from '../capture';
import { collectScreenShareAudio, mergeShareAudio } from '../screenShareAudio';
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
  it('оставляет микрофон репетитора и звук демонстрации', () => {
    const localTrack = { id: 'mic' } as unknown as MediaStreamTrack;
    const remoteTrack = { id: 'remote-mic' } as unknown as MediaStreamTrack;
    const shareTrack = { id: 'share' } as unknown as MediaStreamTrack;
    const sources = [
      { id: 'local', origin: 'local' as const, track: localTrack },
      { id: 'remote', origin: 'remote' as const, track: remoteTrack },
    ];
    const screenShare = [{ id: 'share', track: shareTrack }];
    expect(sourcesAlongsidePlayback(sources, true, screenShare).map((source) => source.id)).toEqual(
      ['local', 'share'],
    );
    expect(
      sourcesAlongsidePlayback(sources, false, screenShare).map((source) => source.id),
    ).toEqual(['local', 'remote', 'share']);
  });
});

describe('collectScreenShareAudio', () => {
  it('берёт звук своей и чужой демонстрации и не останавливает треки', () => {
    const stop = vi.fn();
    const localShare = { readyState: 'live', stop } as unknown as MediaStreamTrack;
    const remoteShare = { readyState: 'live', stop } as unknown as MediaStreamTrack;
    const mic = { readyState: 'live', stop } as unknown as MediaStreamTrack;
    const publications = (
      items: Array<{ source: string; track: MediaStreamTrack; sid: string; subscribed?: boolean }>,
    ) => ({
      forEach: (
        cb: (publication: {
          source: string;
          trackSid: string;
          isSubscribed: boolean;
          track?: { mediaStreamTrack?: MediaStreamTrack } | null;
        }) => void,
      ) => {
        for (const item of items) {
          cb({
            source: item.source,
            trackSid: item.sid,
            isSubscribed: item.subscribed ?? true,
            track: { mediaStreamTrack: item.track },
          });
        }
      },
    });

    const sources = collectScreenShareAudio({
      localParticipant: {
        identity: 'tutor',
        audioTrackPublications: publications([
          { source: 'microphone', track: mic, sid: 'mic' },
          { source: 'screen_share_audio', track: localShare, sid: 'local-share' },
        ]),
      },
      remoteParticipants: {
        forEach: (cb) => {
          cb({
            identity: 'student',
            audioTrackPublications: publications([
              { source: 'screen_share_audio', track: remoteShare, sid: 'remote-share' },
            ]),
          });
        },
      },
    });

    expect(sources.map((source) => source.id)).toEqual([
      'share:local:local-share',
      'share:remote:student:remote-share',
    ]);
    expect(stop).not.toHaveBeenCalled();
  });

  it('узнаёт звук демонстрации по треку, если публикация ещё unknown', () => {
    const track = { readyState: 'live', stop: vi.fn() } as unknown as MediaStreamTrack;
    const sources = collectScreenShareAudio({
      localParticipant: {
        identity: 'tutor',
        getTrackPublications: () => [
          {
            source: 'unknown',
            trackSid: 'share',
            track: { source: 'screen_share_audio', mediaStreamTrack: track },
          },
        ],
      },
      remoteParticipants: { forEach() {} },
    });
    expect(sources.map((source) => source.id)).toEqual(['share:local:share']);
  });
});

describe('mergeShareAudio', () => {
  it('подменяет свой трек LiveKit клоном демонстрации и оставляет чужой', () => {
    const local = { id: 'share:local:1', track: { readyState: 'live' } as MediaStreamTrack };
    const remote = {
      id: 'share:remote:student:2',
      track: { readyState: 'live' } as MediaStreamTrack,
    };
    const display = { id: 'tab-audio', readyState: 'live' } as MediaStreamTrack;
    expect(mergeShareAudio([local, remote], [display]).map((source) => source.id)).toEqual([
      'share:remote:student:2',
      'display:tab-audio',
    ]);
  });
});
