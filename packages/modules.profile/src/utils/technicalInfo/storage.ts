const SENSITIVE_COOKIE_KEYS = [
  'token',
  'auth',
  'session',
  'password',
  'secret',
  'key',
  'access',
  'refresh',
];

const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_COOKIE_KEYS.some((sensitive) => lowerKey.includes(sensitive));
};

export const getCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (document.cookie) {
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key) {
        cookies[key] = isSensitiveKey(key) ? '***' : value || '';
      }
    });
  }
  return cookies;
};

export const getLocalStorageData = (): Record<string, string> => {
  const data: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        data[key] = isSensitiveKey(key) ? '***' : value;
      }
    }
  } catch (error) {
    console.error('Ошибка при чтении localStorage:', error);
  }
  return data;
};

export const getSessionStorageData = (): Record<string, string> => {
  const data: Record<string, string> = {};
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || '';
        data[key] = isSensitiveKey(key) ? '***' : value;
      }
    }
  } catch (error) {
    console.error('Ошибка при чтении sessionStorage:', error);
  }
  return data;
};
