import { UserData } from 'common.types';

/**
 * Ожидание загрузки скрипта Umami
 */
const waitForUmami = (maxAttempts = 50, interval = 100): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'));
      return;
    }

    if (window.umami) {
      resolve();
      return;
    }

    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.umami) {
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('Umami script failed to load'));
      }
    }, interval);
  });
};

/**
 * Трекинг сессии пользователя в Umami
 * @param user - Данные пользователя
 * @param source - Источник идентификации (signin, signup, session_init)
 */
export const trackUmamiSession = async (
  user: UserData,
  source: 'signin' | 'signup' | 'session_init',
) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Ждем загрузки скрипта Umami
    await waitForUmami();

    if (!window.umami) {
      console.warn('Umami script is not available');
      return;
    }

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
