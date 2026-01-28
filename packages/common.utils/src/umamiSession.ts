import { UserData } from 'common.types';

/**
 * Трекинг сессии пользователя в Umami
 * @param user - Данные пользователя
 * @param source - Источник идентификации (signin, signup, session_init)
 */
export const trackUmamiSession = (user: UserData, source: 'signin' | 'signup' | 'session_init') => {
  if (typeof window === 'undefined' || !window.umami) {
    return;
  }

  try {
    // Идентифицируем пользователя с данными сессии
    window.umami.identify(user.id.toString(), {
      username: user.username,
      display_name: user.display_name || undefined,
      role: user.default_layout,
      onboarding_stage: user.onboarding_stage,
      source, // Откуда пришла идентификация
    });
  } catch (error) {
    console.error('Ошибка при трекинге сессии Umami:', error);
  }
};
