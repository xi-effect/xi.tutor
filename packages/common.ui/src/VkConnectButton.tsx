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
 *
 * Клик внутри кросс-доменного iframe не гарантирует всплытие события наружу,
 * поэтому onWidgetInteraction — лишь косметический сигнал для текста «Ожидаем…».
 * Реальное обновление статуса подключения не зависит от того, поймали мы клик или нет
 * (см. фоновый поллинг в useVkConnection).
 */
export function VkConnectButton({
  label,
  className,
  isPreparing = false,
  preparingLabel = 'Формируем ключ…',
  groupId,
  connectionKey,
  onFallbackClick,
  onWidgetInteraction,
  'data-umami-event': umamiEvent,
  'data-umami-event-service': umamiService,
}: VkConnectButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const interactionSentRef = useRef(false);
  const [isWidgetReady, setIsWidgetReady] = useState(false);

  const isOverlayReady = Boolean(groupId && connectionKey);
  const showWidgetOverlay = isOverlayReady && isWidgetReady;
  const showPreparing = (isPreparing && !isOverlayReady) || (isOverlayReady && !isWidgetReady);

  const notifyInteraction = useCallback(() => {
    if (interactionSentRef.current) return;
    interactionSentRef.current = true;
    onWidgetInteraction?.();
  }, [onWidgetInteraction]);

  const handleWidgetReady = useCallback(() => {
    setIsWidgetReady(true);
  }, []);

  useEffect(() => {
    interactionSentRef.current = false;
    setIsWidgetReady(false);
  }, [connectionKey, groupId, isOverlayReady]);

  useEffect(() => {
    if (!showWidgetOverlay) return;

    const root = rootRef.current;

    const onFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLIFrameElement)) return;
      if (!root?.contains(event.target)) return;
      notifyInteraction();
    };

    document.addEventListener('focusin', onFocusIn);

    return () => {
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [notifyInteraction, showWidgetOverlay]);

  return (
    <div
      ref={rootRef}
      className={`relative ml-auto inline-flex h-11 min-w-[11rem] shrink-0 items-center justify-end ${className ?? ''}`}
    >
      {showPreparing ? (
        <span className="text-gray-60 dark:text-gray-80 inline-flex h-11 items-center px-3">
          {isOverlayReady && !isWidgetReady ? 'Загрузка…' : preparingLabel}
        </span>
      ) : (
        <Button
          variant="none"
          type="button"
          tabIndex={showWidgetOverlay ? -1 : 0}
          className={`text-s-base text-brand-100 h-11 w-full justify-end px-3 py-0 ${
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
          aria-label={label}
        >
          <VkAllowMessagesWidget
            key={connectionKey}
            communityId={groupId}
            connectionKey={connectionKey}
            onReady={handleWidgetReady}
            className="h-full w-full min-w-full [&_iframe]:h-full [&_iframe]:min-h-full [&_iframe]:w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
