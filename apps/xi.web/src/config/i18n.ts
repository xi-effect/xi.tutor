import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';

// Динамические импорты переводов для уменьшения размера основного бандла
const loadTranslations = async () => {
  const [
    { signinEn, signinRu },
    { signupEn, signupRu },
    { resetPasswordEn, resetPasswordRu },
    { navigationEn, navigationRu },
    {
      welcomeEn,
      welcomeRu,
      welcomeUserEn,
      welcomeUserRu,
      welcomeRoleEn,
      welcomeRoleRu,
      welcomeAboutEn,
      welcomeAboutRu,
      welcomeSocialsEn,
      welcomeSocialsRu,
    },
    { calendarEn, calendarRu },
  ] = await Promise.all([
    import('pages.signin'),
    import('pages.signup'),
    import('pages.reset-password'),
    import('modules.navigation'),
    import('pages.welcome'),
    import('modules.calendar'),
  ]);

  return {
    signinEn,
    signinRu,
    signupEn,
    signupRu,
    resetPasswordEn,
    resetPasswordRu,
    navigationEn,
    navigationRu,
    welcomeEn,
    welcomeRu,
    welcomeUserEn,
    welcomeUserRu,
    welcomeRoleEn,
    welcomeRoleRu,
    welcomeAboutEn,
    welcomeAboutRu,
    welcomeSocialsEn,
    welcomeSocialsRu,
    calendarEn,
    calendarRu,
  };
};

// Инициализация i18n с динамической загрузкой переводов
const initI18n = async () => {
  const translations = await loadTranslations();

  const resources = {
    en: {
      signin: translations.signinEn,
      signup: translations.signupEn,
      resetPassword: translations.resetPasswordEn,
      navigation: translations.navigationEn,
      welcomeUser: translations.welcomeUserEn,
      welcomeRole: translations.welcomeRoleEn,
      welcomeAbout: translations.welcomeAboutEn,
      welcomeSocials: translations.welcomeSocialsEn,
      welcome: translations.welcomeEn,
      calendar: translations.calendarEn,
    },
    ru: {
      signin: translations.signinRu,
      signup: translations.signupRu,
      resetPassword: translations.resetPasswordRu,
      navigation: translations.navigationRu,
      welcomeUser: translations.welcomeUserRu,
      welcomeRole: translations.welcomeRoleRu,
      welcomeAbout: translations.welcomeAboutRu,
      welcomeSocials: translations.welcomeSocialsRu,
      welcome: translations.welcomeRu,
      calendar: translations.calendarRu,
    },
  };

  await i18n.use(initReactI18next).init({
    resources,
    fallbackLng: 'ru',
    debug: import.meta.env.DEV,
    interpolation: { escapeValue: false },
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
        {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
      ],
    },
  });
};

// Экспортируем промис инициализации для ожидания перед рендерингом
export const i18nInitPromise = initI18n();

export default i18n;
