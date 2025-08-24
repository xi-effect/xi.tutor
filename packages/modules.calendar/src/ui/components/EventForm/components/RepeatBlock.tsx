import { useTranslation } from 'react-i18next';
import { ControllerRenderProps } from 'react-hook-form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
} from '@xipkg/select';
import { Redo } from '@xipkg/icons';

export const RepeatBlock = ({
  field,
}: {
  field: ControllerRenderProps<Record<string, string>, 'shouldRepeat'>;
}) => {
  const { t } = useTranslation('calendar');

  const repeatVariants = [
    { value: 'dont_repeat', label: `${t('repeat_settings.dont_repeat')}` },
    { value: 'every_day', label: `${t('repeat_settings.every_day')}` },
    { value: 'every_work_day', label: `${t('repeat_settings.every_work_day')}` },
    { value: 'every_week', label: `${t('repeat_settings.every_week')}` },
    { value: 'every_2_weeks', label: `${t('repeat_settings.every_2_weeks')}` },
    { value: 'every_month', label: `${t('repeat_settings.every_month')}` },
  ];

  return (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger
        className="no-arrow w-fit border-none"
        size="s"
        before={<Redo className="h-4 w-4" />}
      >
        <SelectValue placeholder={t('event_form.repeat')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={repeatVariants[0].value}>{repeatVariants[0].label}</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          {repeatVariants.slice(1).map((variant) => (
            <SelectItem key={variant.value} value={variant.value}>
              {variant.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
