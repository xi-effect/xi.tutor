import { useEffect, useId, useRef } from 'react';
import {
  clearVkAllowMessagesWidget,
  renderVkAllowMessagesWidget,
  VK_ALLOW_MESSAGES_WIDGET_HEIGHT,
} from 'common.services';

type VkAllowMessagesWidgetProps = {
  communityId: number;
  connectionKey: string;
  className?: string;
  onReady?: () => void;
};

/**
 * Рендерит виджет VK. Для UX обычно оборачивается в VkConnectButton —
 * визуально «Подключить», клик уходит в невидимый iframe виджета.
 */
export function VkAllowMessagesWidget({
  communityId,
  connectionKey,
  className,
  onReady,
}: VkAllowMessagesWidgetProps) {
  const reactId = useId();
  const elementId = `vk_allow_messages_${reactId.replace(/:/g, '')}`;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;

    const markReady = () => {
      if (!cancelled) onReadyRef.current?.();
    };

    renderVkAllowMessagesWidget({ elementId, communityId, connectionKey })
      .then(() => {
        if (cancelled) {
          clearVkAllowMessagesWidget(elementId);
          return;
        }

        const container = document.getElementById(elementId);
        if (container?.querySelector('iframe')) {
          markReady();
          return;
        }

        // iframe появляется чуть позже AllowMessagesFromCommunity
        observer = new MutationObserver(() => {
          if (container?.querySelector('iframe')) {
            observer?.disconnect();
            markReady();
          }
        });

        if (container) {
          observer.observe(container, { childList: true, subtree: true });
        }

        window.setTimeout(() => observer?.disconnect(), 5000);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Ошибка при инициализации VK виджета:', error);
        }
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      clearVkAllowMessagesWidget(elementId);
    };
  }, [communityId, connectionKey, elementId]);

  return (
    <div
      id={elementId}
      className={className}
      style={{
        height: VK_ALLOW_MESSAGES_WIDGET_HEIGHT,
        minHeight: VK_ALLOW_MESSAGES_WIDGET_HEIGHT,
      }}
    />
  );
}
