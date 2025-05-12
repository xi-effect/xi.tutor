import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';

// Импортируем переводы из всех пакетов
import { signinEn, signinRu } from 'pages.signin';
import { signupEn, signupRu } from 'pages.signup';
import { navigationEn, navigationRu } from 'modules.navigation';
import { calendarEn, calendarRu } from 'modules.calendar';

// Собираем переводы
const resources = {
  en: {
    signin: signinEn,
    signup: signupEn,
    navigation: navigationEn,
    calendar: calendarEn,
  },
  ru: {
    signin: signinRu,
    signup: signupRu,
    navigation: navigationRu,
    calendar: calendarRu,
  },
};

i18n.use(initReactI18next).init({
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

export default i18n;
