import { getDisplayMedia, isElectronShell } from 'common.platform';

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

function captureSize(): { width: number; height: number } {
  const ratio = window.devicePixelRatio || 1;
  return {
    width: Math.round(window.screen.width * ratio),
    height: Math.round(window.screen.height * ratio),
  };
}

/** Захват окна приложения в Electron, без системного выбора экрана для демонстрации. */
export async function captureElectronWindow(sourceId: string): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('getUserMedia is not available');
  }
  const { width, height } = captureSize();
  const constraints = {
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
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
  const [video] = stream.getVideoTracks();
  if (video) video.contentHint = 'detail';
  return stream;
}

/**
 * Захват текущей вкладки с уроком. Весь рабочий стол не берём:
 * если пользователь всё же выбрал монитор, поток сразу отпускается.
 */
export async function captureLessonTab(): Promise<MediaStream> {
  if (isElectronShell()) {
    throw new Error('electron capture uses the window source id');
  }
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('getDisplayMedia is not available');
  }

  const { width, height } = captureSize();
  const stream = await getDisplayMedia({
    video: {
      frameRate: { ideal: 60 },
      width: { ideal: width },
      height: { ideal: height },
      displaySurface: 'browser',
    },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    surfaceSwitching: 'exclude',
    monitorTypeSurfaces: 'exclude',
    systemAudio: 'exclude',
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
  return stream;
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
