export const SUBSCRIPTION_BILLING_ENABLED = false;

/**
 * Временный UI привязанной карты ЮKassa (автоплатежи ещё не в production).
 * Не зависит от SUBSCRIPTION_BILLING_ENABLED.
 *
 * На app.sovlium.ru блок виден только пользователям из этого списка
 * (плюс значения из VITE_YOOKASSA_SAVED_CARD_UI_ALLOWED_EMAILS / _USER_IDS).
 * В development блок доступен всем, чтобы можно было собрать интерфейс локально.
 */
export const YOOKASSA_SAVED_CARD_UI_ALLOWED_EMAILS: string[] = [
  // Email тестового аккаунта для скриншотов ЮKassa, например: 'qa@sovlium.ru',
];

export const YOOKASSA_SAVED_CARD_UI_ALLOWED_USER_IDS: number[] = [];
