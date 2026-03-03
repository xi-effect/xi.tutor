import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface DocumentPictureInPicture {
    requestWindow(options?: {
      width?: number;
      height?: number;
      disallowReturnToOpener?: boolean;
      preferInitialWindowPlacement?: boolean;
    }): Promise<Window>;
    window: Window | null;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface DocumentPictureInPictureEvent extends Event {}

  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

type UseDocumentPiPOptions = {
  width?: number;
  height?: number;
  enabled?: boolean;
  /** Сообщить браузеру, что микрофон активен (нужно для авто-PiP в Chrome) */
  microphoneActive?: boolean;
  /** Сообщить браузеру, что камера активна (нужно для авто-PiP в Chrome) */
  cameraActive?: boolean;
};

function copyStylesToWindow(targetWindow: Window) {
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
      const style = document.createElement('style');
      style.textContent = cssRules;
      targetWindow.document.head.appendChild(style);
    } catch {
      if (styleSheet.href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = styleSheet.type || 'text/css';
        link.media = styleSheet.media.mediaText;
        link.href = styleSheet.href;
        targetWindow.document.head.appendChild(link);
      }
    }
  });

  try {
    document.fonts.forEach((font) => {
      targetWindow.document.fonts.add(font);
    });
  } catch {
    // Font copying not supported in this browser
  }
}

export function useDocumentPiP({
  width = 380,
  height = 270,
  enabled = true,
  microphoneActive = false,
  cameraActive = false,
}: UseDocumentPiPOptions = {}) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const pipWindowRef = useRef<Window | null>(null);

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Chrome требует setMicrophoneActive/setCameraActive для авто-PiP при переключении вкладки
  useEffect(() => {
    if (!enabled || typeof navigator?.mediaSession === 'undefined') return;
    try {
      navigator.mediaSession.setMicrophoneActive(microphoneActive);
      navigator.mediaSession.setCameraActive(cameraActive);
    } catch {
      // ignore
    }
  }, [enabled, microphoneActive, cameraActive]);

  const openPiP = useCallback(async (): Promise<Window | null> => {
    if (!isSupported || !enabled) return null;
    if (pipWindowRef.current) return pipWindowRef.current;

    try {
      const pip = await window.documentPictureInPicture!.requestWindow({
        width,
        height,
      });

      copyStylesToWindow(pip);

      pip.document.body.style.margin = '0';
      pip.document.body.style.overflow = 'hidden';

      pipWindowRef.current = pip;
      setPipWindow(pip);

      pip.addEventListener('pagehide', () => {
        pipWindowRef.current = null;
        setPipWindow(null);
      });

      return pip;
    } catch (error) {
      console.warn('[PiP] Failed to open:', error);
      return null;
    }
  }, [isSupported, enabled, width, height]);

  const closePiP = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
    }
  }, []);

  // Auto-PiP via Media Session API: browser triggers this on tab switch
  // when there's active media (LiveKit audio/video satisfies this)
  useEffect(() => {
    if (!isSupported || !enabled) return;

    const handler = async () => {
      await openPiP();
    };

    try {
      navigator.mediaSession.setActionHandler('enterpictureinpicture', handler);
    } catch {
      // enterpictureinpicture action not supported
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('enterpictureinpicture', null);
      } catch {
        // ignore
      }
    };
  }, [isSupported, enabled, openPiP]);

  // При скрытии вкладки пробуем открыть PiP (Chrome для видеозвонков может разрешить без жеста)
  // При возврате на вкладку — закрываем PiP
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pipWindowRef.current) return;
        if (microphoneActive || cameraActive) {
          openPiP().catch(() => {
            // Нет user gesture — нормально, сработает Media Session handler или кнопка
          });
        }
      } else if (pipWindowRef.current) {
        closePiP();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, closePiP, openPiP, microphoneActive, cameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pipWindowRef.current?.close();
      pipWindowRef.current = null;
    };
  }, []);

  return {
    isSupported,
    pipWindow,
    isPiPActive: pipWindow !== null,
    openPiP,
    closePiP,
  };
}
