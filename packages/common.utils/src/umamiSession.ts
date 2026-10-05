import { UserData } from 'common.types';
import { getProductAnalyticsRole } from './productAnalytics/roles';

export type UmamiClientSurface = 'web' | 'pwa' | 'electron' | 'native';

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

type UmamiHost = Window & {
  __SOVLIUM_ELECTRON__?: boolean;
  __SOVLIUM_NATIVE__?: boolean;
  sovliumDesktop?: unknown;
  navigator: Navigator & { standalone?: boolean };
};

/** Поверхность клиента для сегментов Umami. Имена и почта сюда не попадают. */
export function getUmamiClientSurface(): UmamiClientSurface {
  if (typeof window === 'undefined') return 'web';

  const win = window as UmamiHost;
  if (win.__SOVLIUM_ELECTRON__ || win.sovliumDesktop) return 'electron';
  if (win.__SOVLIUM_NATIVE__) return 'native';

  const standalone =
    win.navigator?.standalone === true ||
    (typeof win.matchMedia === 'function' && win.matchMedia('(display-mode: standalone)').matches);
  if (standalone) return 'pwa';

  return 'web';
}

/**
 * Трекинг сессии пользователя в Umami.
 * Первый аргумент identify — distinct id (склейка сессий с 3.3).
 * username и display_name не отправляются.
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

    window.umami.identify(String(user.id), {
      user_id: user.id,
      role: getProductAnalyticsRole(user.default_layout),
      onboarding_stage: user.onboarding_stage,
      source,
      client_surface: getUmamiClientSurface(),
    });
  } catch (error) {
    console.error('Ошибка при трекинге сессии Umami:', error);
  }
};
