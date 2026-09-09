import {
  YOOKASSA_SAVED_CARD_UI_ALLOWED_EMAILS,
  YOOKASSA_SAVED_CARD_UI_ALLOWED_USER_IDS,
} from './config';

export type YookassaSavedCardUiUser = {
  id?: number;
  email?: string | null;
};

const parseCsv = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const uniqueLower = (values: string[]): string[] => [
  ...new Set(values.map((value) => value.toLowerCase())),
];

const uniqueIds = (values: number[]): number[] => [...new Set(values)];

export const getYookassaSavedCardUiAllowedEmails = (): string[] =>
  uniqueLower([
    ...YOOKASSA_SAVED_CARD_UI_ALLOWED_EMAILS,
    ...parseCsv(import.meta.env.VITE_YOOKASSA_SAVED_CARD_UI_ALLOWED_EMAILS),
  ]);

export const getYookassaSavedCardUiAllowedUserIds = (): number[] => {
  const fromEnv = parseCsv(import.meta.env.VITE_YOOKASSA_SAVED_CARD_UI_ALLOWED_USER_IDS)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  return uniqueIds([...YOOKASSA_SAVED_CARD_UI_ALLOWED_USER_IDS, ...fromEnv]);
};

/**
 * Показывает блок «Способ оплаты» только тестовым аккаунтам на production
 * и всем пользователям в development. Не связан с SUBSCRIPTION_BILLING_ENABLED.
 */
export const isYookassaSavedCardUiEnabled = (user?: YookassaSavedCardUiUser): boolean => {
  if (import.meta.env.DEV) return true;

  const emails = getYookassaSavedCardUiAllowedEmails();
  const userIds = getYookassaSavedCardUiAllowedUserIds();
  if (emails.length === 0 && userIds.length === 0) return false;
  if (!user) return false;

  const email = user.email?.trim().toLowerCase();
  if (email && emails.includes(email)) return true;
  if (user.id != null && userIds.includes(user.id)) return true;

  return false;
};
