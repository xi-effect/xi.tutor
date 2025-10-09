/**
 * Конфигурация для аватаров пользователей
 */

export const AVATAR_CONFIG = {
  // Базовый URL для аватаров
  BASE_URL: 'https://api.sovlium.ru/files/users',

  // Формат файла аватара
  FORMAT: 'webp',

  // Размеры аватаров
  SIZES: {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
    xxl: 96,
  },

  // Fallback настройки
  FALLBACK: {
    ENABLED: true,
    LOADING: true,
  },
} as const;

/**
 * Генерирует URL аватара пользователя
 */
export const getAvatarUrl = (userId: string): string => {
  return `${AVATAR_CONFIG.BASE_URL}/${userId}/avatar.${AVATAR_CONFIG.FORMAT}`;
};

/**
 * Проверяет, является ли URL аватара валидным
 */
export const isValidAvatarUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
