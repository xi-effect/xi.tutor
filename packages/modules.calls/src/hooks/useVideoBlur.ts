import { useEffect, useRef } from 'react';
import { LocalVideoTrack } from 'livekit-client';
import { BackgroundProcessor, supportsBackgroundProcessors } from '@livekit/track-processors';
import { useUserChoicesStore } from '../store/userChoices';

export function useVideoBlur(videoTrack: LocalVideoTrack | null | undefined) {
  const blurEnabled = useUserChoicesStore((state) => state.blurEnabled);
  const processorRef = useRef<ReturnType<typeof BackgroundProcessor> | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!videoTrack || !supportsBackgroundProcessors()) {
      // Останавливаем процессор, если трек или поддержка отсутствуют
      if (processorRef.current && videoTrack) {
        videoTrack.stopProcessor().catch(console.error);
        processorRef.current = null;
      }
      return;
    }

    const applyBlur = async () => {
      // Предотвращаем параллельные вызовы
      if (isProcessingRef.current) {
        return;
      }

      isProcessingRef.current = true;

      try {
        // Сначала останавливаем старый процессор, если он есть
        if (processorRef.current) {
          await videoTrack.stopProcessor();
          processorRef.current = null;
        }

        if (blurEnabled) {
          // Создаем новый процессор только если блюр включен
          const processor = BackgroundProcessor({
            mode: 'background-blur',
            blurRadius: 25,
          } as Parameters<typeof BackgroundProcessor>[0]);

          processorRef.current = processor;
          await videoTrack.setProcessor(processor);
        } else {
          // Если блюр выключен, убеждаемся, что процессор остановлен
          await videoTrack.stopProcessor();
          processorRef.current = null;
        }
      } catch (error) {
        console.error('Возникла ошибка, связанная с размытием фона:', error);
        processorRef.current = null;
      } finally {
        isProcessingRef.current = false;
      }
    };

    applyBlur();

    return () => {
      // Cleanup: останавливаем процессор при размонтировании или изменении зависимостей
      if (videoTrack && processorRef.current) {
        videoTrack.stopProcessor().catch(console.error);
        processorRef.current = null;
      }
      isProcessingRef.current = false;
    };
  }, [videoTrack, blurEnabled]);
}
