import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type RepeatVariant = {
  value: string;
  label: string;
};

export const useConstants = () => {
  const { t } = useTranslation('calendar');

  const repeatVariants: RepeatVariant[] = useMemo(() => {
    return [
      { value: 'dont_repeat', label: `${t('repeat_settings.dont_repeat')}` },
      { value: 'every_day', label: `${t('repeat_settings.every_day')}` },
      { value: 'every_work_day', label: `${t('repeat_settings.every_work_day')}` },
      { value: 'every_week', label: `${t('repeat_settings.every_week')}` },
      { value: 'every_2_weeks', label: `${t('repeat_settings.every_2_weeks')}` },
      { value: 'every_month', label: `${t('repeat_settings.every_month')}` },
    ];
  }, [t]);

  return { repeatVariants };
};
