import { FormField, FormItem, FormControl, FormMessage } from '@xipkg/form';
import { Clock, Payments } from '@xipkg/icons';
import { BadgeSelect } from './BadgeSelect/BadgeSelect';
import type { useForm } from '@xipkg/form';
import type { EventFormData } from '../../../../model';
import React from 'react';

interface StatusBlockProps {
  form: ReturnType<typeof useForm<EventFormData>>;
}

export const StatusBlock: React.FC<StatusBlockProps> = ({ form }) => {
  const { control } = form;
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
                  positive: { value: 'paid', label: 'Оплачено' },
                  negative: { value: 'unpaid', label: 'Не оплачено' },
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
                  positive: { value: 'done', label: 'Проведено' },
                  negative: { value: 'not_done', label: 'Не проведено' },
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
