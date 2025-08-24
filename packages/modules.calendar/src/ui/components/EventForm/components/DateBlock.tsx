import { useTranslation } from 'react-i18next';
import { FormControl, FormField, FormItem, FormMessage, useForm } from '@xipkg/form';
import { Switch } from '@xipkg/switcher';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import { ArrowRight, Clock } from '@xipkg/icons';
import { useDateFields } from '../../../../hooks/useEventForm';
import { InputDate } from './InputDate';
import { RepeatBlock } from './RepeatBlock';

import type { FC } from 'react';
import type { EventFormData } from '../../../../model';

interface DateBlockProps {
  form: ReturnType<typeof useForm<EventFormData>>;
}

export const DateBlock: FC<DateBlockProps> = ({ form }) => {
  const { t } = useTranslation('calendar');
  const { control, isAllDay, duration } = useDateFields(form);

  const maskRefStartTime = useMaskInput('time');
  const maskRefEndTime = useMaskInput('time');

  return (
    <>
      <h3 className="mb-2 text-sm">{t('event_form.time')}</h3>

      <div className="mb-2 flex gap-2">
        <FormField
          control={control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  ref={maskRefStartTime}
                  placeholder="00:00"
                  before={<Clock className="h-4 w-4" />}
                  variant="s"
                  className="border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
                  disabled={isAllDay}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <FormField
            control={control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    ref={maskRefEndTime}
                    placeholder="00:00"
                    before={<ArrowRight className="h-4 w-4" />}
                    variant="s"
                    className="border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
                    disabled={isAllDay}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span className="block shrink-0 pt-1.5 text-sm">
            {duration.hours}
            {t('event_form.h')} {duration.minutes}
            {t('event_form.min')}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="mb-2">
              <FormControl>
                <InputDate {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isAllDay && (
          <FormField
            control={control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormControl>
                  <InputDate {...{ ...field, value: field.value || '' }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <FormField
        control={control}
        name="isAllDay"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2 py-2">
              <FormControl>
                <Switch
                  id="all-day-mode"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  size="s"
                />
              </FormControl>
              <label htmlFor="all-day-mode" className="text-sm font-medium">
                {t('event_form.all_day')}
              </label>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="shouldRepeat"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RepeatBlock field={field} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};
