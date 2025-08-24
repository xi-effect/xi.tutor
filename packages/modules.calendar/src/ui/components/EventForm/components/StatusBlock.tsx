import { useTranslation } from 'react-i18next';
import { FormField, FormItem, FormControl, FormMessage } from '@xipkg/form';
import { Clock, Payments } from '@xipkg/icons';
import { useForm } from '@xipkg/form';
import { BadgeSelect } from './BadgeSelect/BadgeSelect';

import type { FC } from 'react';
import type { EventFormData } from '../../../../model';

interface StatusBlockProps {
  form: ReturnType<typeof useForm<EventFormData>>;
}

export const StatusBlock: FC<StatusBlockProps> = ({ form }) => {
  const { control } = form;
  const { t } = useTranslation('calendar');
  return (
    <div className="my-2 flex items-center gap-4 pl-3">
      <FormField
        control={control}
        name="paymentStatus"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <BadgeSelect
                field={{
                  ...field,
                  icon: <Payments className="h-4 w-4" />,
                }}
                options={{
                  positive: { value: 'paid', label: `${t('event_form.statuses.paid')}` },
                  negative: { value: 'unpaid', label: `${t('event_form.statuses.not_paid')}` },
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="lessonStatus"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <BadgeSelect
                field={{
                  ...field,
                  icon: <Clock className="h-4 w-4" />,
                }}
                options={{
                  positive: { value: 'done', label: `${t('event_form.statuses.complete')}` },
                  negative: {
                    value: 'not_done',
                    label: `${t('event_form.statuses.not_complete')}`,
                  },
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
