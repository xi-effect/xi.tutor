// import { cn } from '@xipkg/utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@xipkg/select';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@xipkg/form';
import { LessonBlock } from './components/LessonBlock';
import { useEventForm } from '../../../hooks';
import { StatusBlock } from './components/StatusBlock';

import { type FC } from 'react';
import type { ICalendarEvent } from '../../types';
import { DateBlock } from './components/DateBlock';
import { EventMenu } from './components/EventMenu';

interface EventFormProps {
  calendarEvent?: ICalendarEvent;
}

export const EventForm: FC<EventFormProps> = ({ calendarEvent }) => {
  const { form, control, handleSubmit, selectedType, handleTypeChange, onSubmit } =
    useEventForm(calendarEvent);

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
                    onValueChange={(value) => handleTypeChange(value as 'lesson' | 'rest')}
                  >
                    <SelectTrigger className="border-none" size="s">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="lesson">Занятие</SelectItem>
                        <SelectItem value="rest">Отдых</SelectItem>
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
                  className="border-none outline-none"
                  placeholder="Введите название"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === 'lesson' && <StatusBlock form={form} />}

        {selectedType === 'lesson' && <LessonBlock form={form} />}

        <div className="border-gray-10 border-t border-b py-2">
          <DateBlock form={form} />

          <div className="flex w-full justify-between gap-4 pt-2">
            <Button size="s" variant="secondary" className="w-full" type="button">
              Отмена
            </Button>
            <Button size="s" type="submit" className="w-full">
              Сохранить
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
