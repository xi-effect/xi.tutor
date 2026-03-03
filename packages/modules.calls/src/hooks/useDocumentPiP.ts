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

  // setMicrophoneActive / setCameraActive есть в Chrome 93+, в lib.dom.d.ts пока нет
  interface MediaSession {
    setMicrophoneActive(active: boolean): void;
    setCameraActive(active: boolean): void;
  }
}

type UseDocumentPiPOptions = {
  width?: number;
  height?: number;
  enabled?: boolean;
  microphoneActive?: boolean;
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
    // ignore
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
  const micActiveRef = useRef(microphoneActive);
  const camActiveRef = useRef(cameraActive);

  micActiveRef.current = microphoneActive;
  camActiveRef.current = cameraActive;

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Chrome для авто-PiP при видеозвонках требует setCameraActive / setMicrophoneActive
  useEffect(() => {
    if (!enabled) return;
    try {
      navigator.mediaSession.setMicrophoneActive(microphoneActive);
    } catch {
      // ignore
    }
    try {
      navigator.mediaSession.setCameraActive(cameraActive);
    } catch {
      // ignore
    }
  }, [enabled, microphoneActive, cameraActive]);

  const openPiP = useCallback(
    async (overrides?: { width?: number; height?: number }): Promise<Window | null> => {
      if (!isSupported || !enabled) return null;
      if (pipWindowRef.current) return pipWindowRef.current;

      const w = overrides?.width ?? width;
      const h = overrides?.height ?? height;

      try {
        const pip = await window.documentPictureInPicture!.requestWindow({
          width: w,
          height: h,
        });

        copyStylesToWindow(pip);

        pip.document.body.style.margin = '0';
        pip.document.body.style.overflow = 'hidden';
        pip.document.body.style.background = 'var(--xi-gray-0, #fff)';

        pipWindowRef.current = pip;
        setPipWindow(pip);

        pip.addEventListener('pagehide', () => {
          pipWindowRef.current = null;
          setPipWindow(null);
        });

        return pip;
      } catch {
        return null;
      }
    },
    [isSupported, enabled, width, height],
  );

  const closePiP = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
    }
  }, []);

  // Регистрируем Media Session handler — Chrome вызывает его сам при переключении вкладки.
  // Handler должен быть зарегистрирован и не сниматься (компонент не размонтироваться при роутинге).
  useEffect(() => {
    if (!isSupported || !enabled) return;

    const action = 'enterpictureinpicture' as MediaSessionAction;
    try {
      navigator.mediaSession.setActionHandler(action, () => void openPiP());
    } catch {
      // enterpictureinpicture не поддерживается
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // ignore
      }
    };
  }, [isSupported, enabled, openPiP]);

  // Закрываем PiP при возврате на вкладку
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && pipWindowRef.current) {
        closePiP();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, closePiP]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pipWindowRef.current?.close();
      pipWindowRef.current = null;
    };
  }, []);

  const resizePiP = useCallback((w: number, h: number) => {
    if (pipWindowRef.current) {
      try {
        pipWindowRef.current.resizeTo(w, h);
      } catch {
        // ignore
      }
    }
  }, []);

  return {
    isSupported,
    pipWindow,
    isPiPActive: pipWindow !== null,
    openPiP,
    closePiP,
    resizePiP,
  };
}
