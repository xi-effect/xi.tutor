import type { useNavigate } from '@tanstack/react-router';

export type NavigateFnT = ReturnType<typeof useNavigate>;
export type NotificationLinkNavigateT = (url: string) => void;

export const openNotificationLink = (url: string, navigate: NavigateFnT) => {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate({ to: url });
    }
  } catch (error) {
    console.error('Ошибка при навигации:', error);
  }
};
