import i18n from 'i18next';

export const tProfile = (key: string, options?: Record<string, unknown>): string =>
  String(i18n.t(key, { ns: 'profile', ...options }));
