import i18n from 'i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';

export const LANGUAGE_STORAGE_KEY = 'xi_language';
export type AppLanguage = 'ru' | 'en';

const SUPPORTED: AppLanguage[] = ['ru', 'en'];

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  typeof value === 'string' && SUPPORTED.includes(value as AppLanguage);

export const readStoredLanguage = (): AppLanguage | null => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isAppLanguage(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const normalizeAppLanguage = (lng?: string | null): AppLanguage =>
  lng?.startsWith('en') ? 'en' : 'ru';

export const getAppLanguage = (): AppLanguage => normalizeAppLanguage(i18n.language);

export const getDateLocale = (lng: string = getAppLanguage()): string =>
  normalizeAppLanguage(lng) === 'en' ? 'en-US' : 'ru-RU';

export const syncLanguageSideEffects = (lng: string) => {
  const language = normalizeAppLanguage(lng);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
  dayjs.locale(language);
};

export const setAppLanguage = async (lng: AppLanguage) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // ignore
  }
  await i18n.changeLanguage(lng);
  syncLanguageSideEffects(lng);
};
