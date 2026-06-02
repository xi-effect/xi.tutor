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
  navigate({
    to: options.to as never,
    params: (options.params ?? {}) as never,
    search: (prev) =>
      ({
        ...(prev as Record<string, string | undefined>),
        ...(options.search ?? {}),
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
