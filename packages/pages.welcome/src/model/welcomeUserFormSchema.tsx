import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const displayNameMinLength = 1;
const displayNameMaxLength = 30;

export const useWelcomeUserFormSchema = () => {
  const { t } = useTranslation('welcomeUser');

  const formSchema = useMemo(() => {
    return z.object({
      displayName: z
        .string()
        .min(1, {
          message: t('validation.required'),
        })
        .min(displayNameMinLength, {
          message: `${t('validation.minLength')}${t('validation.symbols', { count: displayNameMinLength })}`,
        })
        .max(displayNameMaxLength, {
          message: `${t('validation.maxLength')}${t('validation.symbols', { count: displayNameMaxLength })}`,
        }),
    });
  }, [t]);

  return formSchema;
};
