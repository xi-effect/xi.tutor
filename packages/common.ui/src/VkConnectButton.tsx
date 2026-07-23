import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { VkAllowMessagesWidget } from './VkAllowMessagesWidget';

type VkConnectButtonProps = {
  label: string;
  className?: string;
  isPreparing?: boolean;
  preparingLabel?: string;
  groupId?: number | null;
  connectionKey?: string | null;
  isAwaitingConfirmation?: boolean;
  onFallbackClick?: () => void;
  onWidgetInteraction?: () => void;
  'data-umami-event'?: string;
  'data-umami-event-service'?: string;
};

/**
 * Стилизованная кнопка + невидимый виджет VK сверху.
 * mousedown по <iframe> всплывает к родителю — по нему (с задержкой) стартуем ожидание,
 * чтобы React не перерисовал iframe до завершения клика внутри VK.
 */
export function VkConnectButton({
  label,
  className,
  isPreparing = false,
  preparingLabel = 'Формируем ключ…',
  groupId,
  connectionKey,
  isAwaitingConfirmation = false,
  onFallbackClick,
  onWidgetInteraction,
  'data-umami-event': umamiEvent,
  'data-umami-event-service': umamiService,
}: VkConnectButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const interactionSentRef = useRef(false);
  const notifyTimerRef = useRef<number | null>(null);

  const [isWidgetReady, setIsWidgetReady] = useState(false);

  const isOverlayReady = Boolean(groupId && connectionKey);
  const showWidgetOverlay = isOverlayReady && isWidgetReady;
  const showPreparing = (isPreparing && !isOverlayReady) || (isOverlayReady && !isWidgetReady);

  const clearNotifyTimer = useCallback(() => {
    if (notifyTimerRef.current != null) {
      window.clearTimeout(notifyTimerRef.current);
      notifyTimerRef.current = null;
    }
  }, []);

  const notifyInteraction = useCallback(() => {
    if (interactionSentRef.current) return;
    interactionSentRef.current = true;
    onWidgetInteraction?.();
  }, [onWidgetInteraction]);

  const scheduleNotifyInteraction = useCallback(() => {
    if (interactionSentRef.current) return;
    clearNotifyTimer();
    notifyTimerRef.current = window.setTimeout(() => {
      notifyTimerRef.current = null;
      notifyInteraction();
    }, 400);
  }, [clearNotifyTimer, notifyInteraction]);

  const handleWidgetReady = useCallback(() => {
    setIsWidgetReady(true);
  }, []);

  useEffect(() => {
    if (!isOverlayReady) {
      clearNotifyTimer();
      setIsWidgetReady(false);
      interactionSentRef.current = false;
      return;
    }

    setIsWidgetReady(false);
    interactionSentRef.current = false;
  }, [clearNotifyTimer, connectionKey, groupId, isOverlayReady]);

  useEffect(() => {
    if (!isAwaitingConfirmation) {
      interactionSentRef.current = false;
    }
  }, [isAwaitingConfirmation]);

  useEffect(() => {
    if (!showWidgetOverlay) return;
    const root = rootRef.current;
    if (!root) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target instanceof HTMLIFrameElement || target.closest('iframe')) {
        scheduleNotifyInteraction();
      }
    };

    root.addEventListener('mousedown', onMouseDown, true);
    return () => root.removeEventListener('mousedown', onMouseDown, true);
  }, [scheduleNotifyInteraction, showWidgetOverlay]);

  useEffect(() => () => clearNotifyTimer(), [clearNotifyTimer]);

  return (
    <div
      ref={rootRef}
      className={`relative ml-auto inline-flex h-8 w-[7.5rem] shrink-0 items-center justify-end ${className ?? ''}`}
    >
      {showPreparing ? (
        <span className="text-gray-60 dark:text-gray-80 inline-flex h-8 items-center">
          {isOverlayReady && !isWidgetReady ? 'Загрузка…' : preparingLabel}
        </span>
      ) : (
        <Button
          variant="none"
          type="button"
          tabIndex={showWidgetOverlay ? -1 : 0}
          className={`text-s-base text-brand-100 h-8 w-full justify-end px-2 py-0 ${
            showWidgetOverlay ? 'pointer-events-none' : ''
          }`}
          aria-hidden={showWidgetOverlay}
          onClick={showWidgetOverlay ? undefined : onFallbackClick}
          data-umami-event={umamiEvent}
          data-umami-event-service={umamiService}
        >
          {label}
        </Button>
      )}

      {isOverlayReady && groupId && connectionKey ? (
        <div
          className={`absolute inset-0 z-10 overflow-hidden ${
            showWidgetOverlay ? 'cursor-pointer opacity-[0.01]' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!showWidgetOverlay}
          aria-label={showWidgetOverlay ? label : undefined}
        >
          <VkAllowMessagesWidget
            communityId={groupId}
            connectionKey={connectionKey}
            onReady={handleWidgetReady}
            className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
