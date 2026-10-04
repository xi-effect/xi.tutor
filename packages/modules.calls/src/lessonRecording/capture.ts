import { getSovliumDesktop, getUnpatchedDisplayMedia, isElectronShell } from 'common.platform';

type TabCaptureOptions = DisplayMediaStreamOptions & {
  preferCurrentTab?: boolean;
  selfBrowserSurface?: 'include' | 'exclude';
  surfaceSwitching?: 'include' | 'exclude';
  monitorTypeSurfaces?: 'include' | 'exclude';
  systemAudio?: 'include' | 'exclude';
};

function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

export type CapturedLesson = {
  video: MediaStream;
  /** Звук вкладки или компьютера. Может лежать в `video` или в `extraStream`. */
  playbackTrack: MediaStreamTrack | null;
  /**
   * Этот звук уже содержит то, что играет звонок: удалённых участников
   * отдельно подмешивать не нужно, иначе голос удваивается.
   */
  playbackIncludesCall: boolean;
  /** Отдельный поток системного звука. Его нужно остановить вместе с записью. */
  extraStream: MediaStream | null;
};

const playbackAudioConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  suppressLocalAudioPlayback: false,
};

/**
 * Пока играет звук компьютера или вкладки, микрофон репетитора остаётся отдельно,
 * а удалённые участники уже входят в этот звук.
 */
export function sourcesAlongsidePlayback<T extends { origin: 'local' | 'remote' }>(
  sources: T[],
  playbackIncludesCall: boolean,
): T[] {
  if (!playbackIncludesCall) return sources;
  return sources.filter((source) => source.origin === 'local');
}

function captureSize(): { width: number; height: number } {
  const ratio = window.devicePixelRatio || 1;
  return {
    width: Math.round(window.screen.width * ratio),
    height: Math.round(window.screen.height * ratio),
  };
}

type DesktopMediaConstraints = {
  audio:
    | boolean
    | {
        mandatory: {
          chromeMediaSource: 'desktop';
          chromeMediaSourceId: string;
        };
      };
  video: {
    mandatory: {
      chromeMediaSource: 'desktop';
      chromeMediaSourceId: string;
      maxFrameRate: number;
      maxWidth: number;
      maxHeight: number;
    };
  };
};

async function captureDesktop(constraints: DesktopMediaConstraints): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
}

/**
 * Системный звук через источник экрана. Видео этого потока в запись не берём,
 * но трек не останавливаем сразу: иначе Chromium часто глушит и звук.
 */
/** Системный звук через loopback. Видео потока оставляем живым, иначе Chromium глушит звук. */
async function captureSystemLoopback(): Promise<MediaStream | null> {
  const desktop = getSovliumDesktop();
  if (!desktop) return null;
  try {
    await desktop.recording.armSystemAudio();
    const stream = await getUnpatchedDisplayMedia({ video: true, audio: true });
    const [audio] = stream.getAudioTracks();
    if (!audio) {
      stopStream(stream);
      return null;
    }
    return stream;
  } catch {
    return null;
  }
}

async function captureDesktopPlayback(sourceId: string): Promise<MediaStream | null> {
  if (!sourceId) return null;
  try {
    const stream = await captureDesktop({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          maxFrameRate: 1,
          maxWidth: 16,
          maxHeight: 16,
        },
      },
    });
    const [audio] = stream.getAudioTracks();
    if (!audio) {
      stopStream(stream);
      return null;
    }
    return stream;
  } catch {
    return null;
  }
}

/** Захват окна приложения в Electron, без системного выбора экрана для демонстрации. */
export async function captureElectronWindow(
  sourceId: string,
  systemSourceId = '',
): Promise<CapturedLesson> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('getUserMedia is not available');
  }
  const { width, height } = captureSize();
  const stream = await captureDesktop({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        maxFrameRate: 60,
        maxWidth: width,
        maxHeight: height,
      },
    },
  });
  const [video] = stream.getVideoTracks();
  if (video) video.contentHint = 'detail';

  const loopback = await captureSystemLoopback();
  if (loopback) {
    return {
      video: stream,
      playbackTrack: loopback.getAudioTracks()[0] ?? null,
      playbackIncludesCall: true,
      extraStream: loopback,
    };
  }

  const system = await captureDesktopPlayback(systemSourceId);
  if (system) {
    return {
      video: stream,
      playbackTrack: system.getAudioTracks()[0] ?? null,
      playbackIncludesCall: true,
      extraStream: system,
    };
  }

  const windowAudio = await captureDesktopPlayback(sourceId);
  return {
    video: stream,
    playbackTrack: windowAudio?.getAudioTracks()[0] ?? null,
    playbackIncludesCall: false,
    extraStream: windowAudio,
  };
}

/**
 * Захват текущей вкладки с уроком. Весь рабочий стол не берём:
 * если пользователь всё же выбрал монитор, поток сразу отпускается.
 */
export async function captureLessonTab(): Promise<CapturedLesson> {
  if (isElectronShell()) {
    throw new Error('electron capture uses the window source id');
  }
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('getDisplayMedia is not available');
  }

  const { width, height } = captureSize();
  const stream = await getUnpatchedDisplayMedia({
    video: {
      frameRate: { ideal: 60 },
      width: { ideal: width },
      height: { ideal: height },
      displaySurface: 'browser',
    },
    audio: playbackAudioConstraints,
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    surfaceSwitching: 'exclude',
    monitorTypeSurfaces: 'exclude',
    systemAudio: 'include',
  } as TabCaptureOptions);

  const [video] = stream.getVideoTracks();
  if (!video) {
    stopStream(stream);
    throw new Error('capture has no video');
  }

  if (video.getSettings().displaySurface === 'monitor') {
    stopStream(stream);
    throw new Error('desktop-rejected');
  }

  video.contentHint = 'detail';
  const [playbackTrack] = stream.getAudioTracks();
  return {
    video: stream,
    playbackTrack: playbackTrack ?? null,
    playbackIncludesCall: Boolean(playbackTrack),
    extraStream: null,
  };
}

export function mapCaptureError(
  error: unknown,
): 'cancelled' | 'desktop_rejected' | 'capture_unsupported' | 'unknown' {
  if (error instanceof Error && error.message === 'desktop-rejected') return 'desktop_rejected';
  if (
    error instanceof DOMException &&
    (error.name === 'NotAllowedError' || error.name === 'AbortError')
  ) {
    return 'cancelled';
  }
  if (error instanceof DOMException && error.name === 'NotSupportedError')
    return 'capture_unsupported';
  if (error instanceof Error && /not available/i.test(error.message)) return 'capture_unsupported';
  return 'unknown';
}
