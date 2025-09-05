import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@xipkg/select';
import { Button } from '@xipkg/button';
import { Badge } from '@xipkg/badge';
import { Input } from '@xipkg/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@xipkg/form';
import { useEventForm } from '../../../hooks';
import { useCloseForm, useLessonStatuses } from '../../../store/formEventStore';
import { LessonBlock, DateBlock, EventMenu } from './components';

import './EventForm.css';

import type { EventType } from '../../types';

export const EventForm = () => {
  const { t } = useTranslation('calendar');

  const { form, control, selectedType, handleSubmit, handleTypeChange, onSubmit } = useEventForm();

  const { paid, complete } = useLessonStatuses();

  const handleCloseForm = useCloseForm();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="border-gray-10 w-full border-l px-2">
        <div className="mb-2 flex w-full items-center justify-between gap-2">
          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value: EventType) => handleTypeChange(value)}
                  >
                    <SelectTrigger className="text-gray-80 border-none" size="s">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="lesson">{t('event_form.lesson')}</SelectItem>
                        <SelectItem value="rest">{t('event_form.rest')}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <EventMenu />
        </div>

        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  className="border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
                  placeholder={t('event_form.enter_title')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === 'lesson' && (
          <div className="my-2 flex items-center gap-4 pl-3">
            <Badge variant={paid ? 'success' : 'destructive'}>
              {paid ? t('event_form.statuses.paid') : t('event_form.statuses.not_paid')}
            </Badge>
            <Badge variant={complete ? 'success' : 'destructive'}>
              {complete ? t('event_form.statuses.complete') : t('event_form.statuses.not_complete')}
            </Badge>
          </div>
        )}

        {selectedType === 'lesson' && <LessonBlock form={form} />}

        <div className="border-gray-10 border-t border-b py-2">
          <DateBlock form={form} />

          <div className="flex w-full justify-between gap-4 pt-2">
            <Button
              size="s"
              variant="secondary"
              className="w-full"
              type="button"
              onClick={handleCloseForm}
            >
              {t('event_form.cancel')}
            </Button>
            <Button size="s" type="submit" className="w-full">
              {t('event_form.save')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
