import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const displayNameMinLength = 1;
const displayNameMaxLength = 30;

type Translate = (key: string, params?: Record<string, unknown>) => unknown;

/** Чистая zod-схема шага профиля онбординга. */
export const createWelcomeUserFormSchema = (t: Translate) =>
  z.object({
    displayName: z
      .string()
      .min(1, {
        message: String(t('validation.required') || 'validation.required'),
      })
      .min(displayNameMinLength, {
        message: `${t('validation.minLength')}${t('validation.symbols', { count: displayNameMinLength })}`,
      })
      .max(displayNameMaxLength, {
        message: `${t('validation.maxLength')}${t('validation.symbols', { count: displayNameMaxLength })}`,
      }),
  });

export const useWelcomeUserFormSchema = () => {
  const { t } = useTranslation('welcomeUser');
  return useMemo(() => createWelcomeUserFormSchema(t), [t]);
};

export type WelcomeUserFormSchema = ReturnType<typeof createWelcomeUserFormSchema>;
