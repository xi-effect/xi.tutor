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
  // Повторный клик по уведомлению на той же странице: без токена router не меняет search и диплинк не срабатывает
  if (nextSearch.event_instance_id != null || nextSearch.focused_at != null) {
    nextSearch.schedule_dl = String(Date.now());
  }

  navigate({
    to: options.to as never,
    params: (options.params ?? {}) as never,
    search: (prev) =>
      ({
        ...(prev as Record<string, string | undefined>),
        ...nextSearch,
      }) as never,
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
