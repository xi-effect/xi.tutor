import { ConferenceAudioMixer, type MixerAudioSource } from './audioMixer';
import type { RecordingFormat, RecordingResult, RecordingSink } from './types';

const CHUNK_MS = 1000;
const VIDEO_BITS_PER_SECOND = 16_000_000;
const AUDIO_BITS_PER_SECOND = 256_000;

export type LessonRecorderStart = {
  videoStream: MediaStream;
  audioSources: MixerAudioSource[];
  sink: RecordingSink;
  mimeType: string;
  format: RecordingFormat;
  /** Создан в обработчике клика, чтобы AudioContext успел выйти из suspended. */
  mixer?: ConferenceAudioMixer;
};

/**
 * Сводит видео области урока и звук конференции.
 * Куски уходят в sink сразу, файл целиком в памяти не держится, если sink пишет на диск.
 */
export class LessonRecorder {
  private readonly mixer: ConferenceAudioMixer;
  private readonly videoStream: MediaStream;
  private readonly sink: RecordingSink;
  private readonly format: RecordingFormat;
  private readonly mimeType: string;
  private readonly mediaRecorder: MediaRecorder;
  private writeQueue: Promise<void> = Promise.resolve();
  private stopping: Promise<RecordingResult> | null = null;
  private sinkFailed = false;
  readonly startedAt: number;

  private constructor(options: {
    mixer: ConferenceAudioMixer;
    videoStream: MediaStream;
    sink: RecordingSink;
    format: RecordingFormat;
    mimeType: string;
    mediaRecorder: MediaRecorder;
    startedAt: number;
  }) {
    this.mixer = options.mixer;
    this.videoStream = options.videoStream;
    this.sink = options.sink;
    this.format = options.format;
    this.mimeType = options.mimeType;
    this.mediaRecorder = options.mediaRecorder;
    this.startedAt = options.startedAt;
  }

  static async start(input: LessonRecorderStart): Promise<LessonRecorder> {
    const mixer = input.mixer ?? new ConferenceAudioMixer();
    try {
      await mixer.resume();
      mixer.sync(input.audioSources);
      const [video] = input.videoStream.getVideoTracks();
      if (!video || video.readyState === 'ended') {
        throw new Error('capture ended');
      }
      await waitForVideoFrames(video);
      const tracks: MediaStreamTrack[] = [video];
      if (mixer.isRunning) tracks.push(mixer.audioTrack);
      const recordingStream = new MediaStream(tracks);
      const mediaRecorder = createMediaRecorder(recordingStream, input.mimeType);
      const recorder = new LessonRecorder({
        mixer,
        videoStream: input.videoStream,
        sink: input.sink,
        format: input.format,
        mimeType: input.mimeType,
        mediaRecorder,
        startedAt: Date.now(),
      });
      recorder.attach();
      mediaRecorder.start(CHUNK_MS);
      return recorder;
    } catch (error) {
      await mixer.close().catch(() => undefined);
      input.videoStream.getTracks().forEach((track) => track.stop());
      await input.sink.abort().catch(() => undefined);
      throw error;
    }
  }

  setAudioSources(sources: MixerAudioSource[]): void {
    if (this.stopping) return;
    this.mixer.sync(sources);
  }

  stop(): Promise<RecordingResult> {
    if (this.stopping) return this.stopping;
    this.stopping = this.finish();
    return this.stopping;
  }

  private attach(): void {
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size === 0 || this.sinkFailed) return;
      this.writeQueue = this.writeQueue
        .then(() => this.sink.write(event.data))
        .catch(() => {
          this.sinkFailed = true;
          if (!this.stopping) void this.stop();
        });
    };

    const [video] = this.videoStream.getVideoTracks();
    video?.addEventListener('ended', () => {
      if (!this.stopping) void this.stop();
    });

    this.mediaRecorder.onerror = () => {
      if (!this.stopping) void this.stop();
    };
  }

  private async finish(): Promise<RecordingResult> {
    const durationSeconds = Math.max(0, Math.round((Date.now() - this.startedAt) / 1000));
    await stopMediaRecorder(this.mediaRecorder);
    try {
      await this.writeQueue;
    } catch {
      this.sinkFailed = true;
    }

    try {
      if (this.sinkFailed) {
        await this.sink.abort();
        throw new Error('sink_error');
      }
      const saved = await this.sink.finalize(durationSeconds * 1000);
      return {
        sizeBytes: saved.sizeBytes,
        filename: saved.filename,
        format: this.format,
        mimeType: this.mimeType,
        durationSeconds,
      };
    } finally {
      await this.mixer.close().catch(() => undefined);
      this.videoStream.getTracks().forEach((track) => track.stop());
    }
  }
}

function createMediaRecorder(stream: MediaStream, mimeType: string): MediaRecorder {
  const attempts: MediaRecorderOptions[] = [
    {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
      audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
    },
    {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: 8_000_000,
      audioBitsPerSecond: 192_000,
    },
    mimeType ? { mimeType } : {},
  ];
  let lastError: unknown;
  for (const options of attempts) {
    try {
      return new MediaRecorder(stream, options);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  return new MediaRecorder(stream);
}

function waitForVideoFrames(track: MediaStreamTrack): Promise<void> {
  if (track.readyState === 'ended') return Promise.reject(new Error('capture ended'));
  if (!track.muted) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const finish = (error?: Error) => {
      window.clearTimeout(timer);
      track.removeEventListener('unmute', onUnmute);
      track.removeEventListener('ended', onEnded);
      if (error) reject(error);
      else resolve();
    };
    const onUnmute = () => finish();
    const onEnded = () => finish(new Error('capture ended'));
    const timer = window.setTimeout(() => finish(), 2000);
    track.addEventListener('unmute', onUnmute);
    track.addEventListener('ended', onEnded);
  });
}

function stopMediaRecorder(recorder: MediaRecorder): Promise<void> {
  if (recorder.state === 'inactive') return Promise.resolve();
  return new Promise((resolve) => {
    recorder.addEventListener('stop', () => resolve(), { once: true });
    try {
      if (recorder.state === 'recording') recorder.requestData();
      recorder.stop();
    } catch {
      resolve();
    }
  });
}
