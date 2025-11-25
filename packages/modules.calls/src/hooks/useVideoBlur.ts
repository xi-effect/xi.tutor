import { useEffect } from 'react';
import { LocalVideoTrack } from 'livekit-client';
import { BackgroundProcessor, supportsBackgroundProcessors } from '@livekit/track-processors';
import { useUserChoicesStore } from '../store/userChoices';

export function useVideoBlur(videoTrack: LocalVideoTrack | null | undefined) {
  const blurEnabled = useUserChoicesStore((state) => state.blurEnabled);

  useEffect(() => {
    if (!videoTrack) {
      return;
    }

    if (!supportsBackgroundProcessors()) {
      return;
    }

    const applyBlur = async () => {
      try {
        if (blurEnabled) {
          const processor = BackgroundProcessor({
            mode: 'background-blur',
            blurRadius: 15,
          } as Parameters<typeof BackgroundProcessor>[0]);

          await videoTrack.setProcessor(processor);
        } else {
          await videoTrack.stopProcessor();
        }
      } catch (error) {
        console.error('Возникла ошибка, связанная с размытием фона:', error);
      }
    };

    applyBlur();

    return () => {
      if (videoTrack) {
        videoTrack.stopProcessor().catch(console.error);
      }
    };
  }, [videoTrack, blurEnabled]);
}
