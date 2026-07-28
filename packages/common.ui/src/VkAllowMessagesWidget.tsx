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
    const timeoutIds: number[] = [];

    const setTimeoutTracked = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timeoutIds.push(id);
      return id;
    };

    // Появление iframe в DOM ещё не значит, что VK успел загрузить и
    // инициализировать содержимое внутри — ждём именно события load,
    // а не фиксированную задержку (на медленной сети её может не хватить,
    // и первый клик по «пустому» iframe будет незамеченным).
    const scheduleReady = (iframe: HTMLIFrameElement | null) => {
      let settled = false;
      const fire = () => {
        if (settled || cancelled) return;
        settled = true;
        onReadyRef.current?.();
      };

      if (iframe) {
        iframe.addEventListener('load', () => setTimeoutTracked(fire, 150), { once: true });
      }

      // Подстраховка: если load не сработает (блокировщики, кэш и т.п.),
      // не оставляем кнопку навечно в состоянии «Загрузка…»
      setTimeoutTracked(fire, 2500);
    };

    renderVkAllowMessagesWidget({ elementId, communityId, connectionKey })
      .then(() => {
        if (cancelled) {
          clearVkAllowMessagesWidget(elementId);
          return;
        }

        const container = document.getElementById(elementId);
        const existingIframe = container?.querySelector('iframe') ?? null;
        if (existingIframe) {
          scheduleReady(existingIframe);
          return;
        }

        // iframe появляется чуть позже AllowMessagesFromCommunity
        observer = new MutationObserver(() => {
          const iframe = container?.querySelector('iframe');
          if (iframe) {
            observer?.disconnect();
            scheduleReady(iframe);
          }
        });

        if (container) {
          observer.observe(container, { childList: true, subtree: true });
        }

        setTimeoutTracked(() => observer?.disconnect(), 5000);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Ошибка при инициализации VK виджета:', error);
        }
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      timeoutIds.forEach((id) => window.clearTimeout(id));
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
