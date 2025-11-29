import { useState, useEffect } from 'react';

export const useFullScreen = (containerId: string) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const hasStandardFullscreen =
    typeof document !== 'undefined' &&
    document.fullscreenEnabled &&
    typeof HTMLElement.prototype.requestFullscreen === 'function';

  const isFullScreenSupported = hasStandardFullscreen;

  const toggleFullScreen = () => {
    const element = document.getElementById(containerId);
    const fullScreen = document.fullscreenElement;

    if (fullScreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    } else {
      element?.requestFullscreen();
      setIsFullScreen(true);
    }
  };

  useEffect(() => {
    if (!isFullScreenSupported) return;

    const handleFullScreenChange = () => {
      const fullScreen = !!document.fullscreenElement;
      setIsFullScreen(fullScreen);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [isFullScreenSupported]);

  return { toggleFullScreen, isFullScreen, isFullScreenSupported };
};
