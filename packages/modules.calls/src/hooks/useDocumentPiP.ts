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

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Диагностика при монтировании
  useEffect(() => {
    if (!enabled) return;

    console.info('[PiP] Document PiP API supported:', isSupported);
    console.info('[PiP] enabled:', enabled);
    console.info('[PiP] microphoneActive:', microphoneActive, 'cameraActive:', cameraActive);

    if (typeof navigator?.mediaSession !== 'undefined') {
      console.info('[PiP] Media Session API available');
    } else {
      console.warn('[PiP] Media Session API NOT available');
    }
  }, [enabled, isSupported, microphoneActive, cameraActive]);

  // Chrome для авто-PiP при видеозвонках требует setCameraActive / setMicrophoneActive
  useEffect(() => {
    if (!enabled) return;
    try {
      navigator.mediaSession.setMicrophoneActive(microphoneActive);
    } catch (e) {
      console.warn('[PiP] setMicrophoneActive failed:', e);
    }
    try {
      navigator.mediaSession.setCameraActive(cameraActive);
    } catch (e) {
      console.warn('[PiP] setCameraActive failed:', e);
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
      pip.document.body.style.background = 'var(--xi-gray-0, #fff)';

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

  // Регистрируем Media Session handler — Chrome вызывает его автоматически
  // при переключении вкладки, если getUserMedia активен
  useEffect(() => {
    if (!isSupported || !enabled) {
      console.info(
        '[PiP] Skipping handler registration. isSupported:',
        isSupported,
        'enabled:',
        enabled,
      );
      return;
    }

    const action = 'enterpictureinpicture' as MediaSessionAction;
    try {
      navigator.mediaSession.setActionHandler(action, async () => {
        console.info('[PiP] enterpictureinpicture handler CALLED by browser');
        await openPiP();
      });
      console.info('[PiP] enterpictureinpicture handler registered successfully');
    } catch (e) {
      console.warn('[PiP] Failed to register enterpictureinpicture handler:', e);
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

  return {
    isSupported,
    pipWindow,
    isPiPActive: pipWindow !== null,
    openPiP,
    closePiP,
  };
}
