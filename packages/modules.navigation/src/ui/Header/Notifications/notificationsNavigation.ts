import type { useNavigate } from '@tanstack/react-router';
import {
  buildNotificationHref,
  openNotificationLinkWithRouter,
  parseNotificationUrl,
} from 'common.services';

export type NavigateFnT = ReturnType<typeof useNavigate>;
export type NotificationLinkNavigateT = (url: string) => void;

const navigateToNotification = (
  navigate: NavigateFnT,
  options: {
    to: string;
    params?: Record<string, string>;
    search?: Record<string, string>;
  },
) => {
  const nextSearch = { ...(options.search ?? {}) };

  navigate({
    to: options.to as never,
    params: (options.params ?? {}) as never,
    search: (prev) => {
      const merged: Record<string, string | undefined> = {
        ...(prev as Record<string, string | undefined>),
        ...nextSearch,
      };

      // Взаимоисключающие диплинки — иначе остаётся старый event_instance_id и открывается модалка
      if (nextSearch.focused_at != null) {
        delete merged.event_instance_id;
      }
      if (nextSearch.event_instance_id != null) {
        delete merged.focused_at;
      }

      // Повторный клик на той же странице (только внутренний токен, сразу снимается после обработки)
      if (merged.focused_at != null || merged.event_instance_id != null) {
        merged.schedule_dl = String(Date.now());
      }

      return merged as never;
    },
  });
};

export const openNotificationLink = (url: string, navigate: NavigateFnT) => {
  try {
    openNotificationLinkWithRouter(url, (options) => navigateToNotification(navigate, options));
  } catch (error) {
    console.error('Ошибка при навигации:', error);
    const parsed = parseNotificationUrl(url);
    if (parsed !== 'external' && parsed != null) {
      window.location.assign(buildNotificationHref(parsed));
    }
  }
};

export { navigateToNotification };
