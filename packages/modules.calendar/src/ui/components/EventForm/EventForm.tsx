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
import { Switch } from '@xipkg/switcher';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@xipkg/form';
import { ArrowRight, Clock, MenuDots, Redo, Account, Updates, Payments, Hint } from '@xipkg/icons';

import { type FC } from 'react';
import type { ICalendarEvent } from '../../types';
import { useEventForm } from '../../../hooks';
import { students } from '../../../mocks';

interface EventFormProps {
  calendarEvent?: ICalendarEvent;
}

export const EventForm: FC<EventFormProps> = ({ calendarEvent }) => {
  const {
    form,
    control,
    handleSubmit,
    selectedType,
    selectedStudent,
    duration,
    handleTypeChange,
    onSubmit,
  } = useEventForm(calendarEvent);

  const maskRefStartTime = useMaskInput('time');
  const maskRefEndTime = useMaskInput('time');

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full px-2">
        <div className="flex w-full items-center justify-between gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-gray-0 flex h-8 w-8 items-center justify-center text-sm">
              <MenuDots className="rotate-90" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Вырезать</DropdownMenuItem>
              <DropdownMenuItem>Копировать</DropdownMenuItem>
              <DropdownMenuItem>Дублировать</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-80">Удалить</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Название */}
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  className="mt-2 border-none outline-none"
                  placeholder="Введите название"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === 'lesson' && (
          <div className="border-gray-10 w-full border-t border-b py-2">
            <h3 className="mb-2 text-sm">Кабинет</h3>

            <FormField
              control={control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        before={<Account className="h-4 w-4" />}
                        size="s"
                        className="mb-2 w-full border-none outline-none"
                      >
                        <SelectValue placeholder="Студент или группа" />
                      </SelectTrigger>
                      <SelectContent className="w-full max-w-[300px]">
                        <SelectGroup>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="subjectName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={selectedStudent?.subject.name || field.value}
                      placeholder="Предмет"
                      className="mb-2 w-full border-none outline-none"
                      before={<Updates className="h-4 w-4" />}
                      variant="s"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="lessonType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        before={<Payments className="h-4 w-4" />}
                        size="s"
                        className="mb-2 w-full border-none outline-none"
                      >
                        <SelectValue placeholder="Тип занятия" />
                      </SelectTrigger>
                      <SelectContent className="w-full max-w-[300px]">
                        <SelectGroup>
                          <SelectItem value="group">Групповое</SelectItem>
                          <SelectItem value="individual">Индивидуальное</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Описание"
                      className="w-full border-none outline-none"
                      before={<Hint className="h-4 w-4" />}
                      variant="s"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="border-gray-10 border-t border-b py-2">
          <h3 className="mb-2 text-sm">Время</h3>

          <div className="mb-4 flex items-center gap-2">
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
                      className="border-none outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
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
                        className="border-none outline-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="shrink-0 text-sm">
                {duration.hours}ч {duration.minutes}м
              </span>
            </div>
          </div>

          {/* Весь день */}
          <FormField
            control={control}
            name="isAllDay"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      id="all-day-mode"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <label htmlFor="all-day-mode" className="text-sm font-medium">
                    Весь день
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Повторять */}
          <div className="mt-2 flex items-center gap-2 px-2 py-1">
            <Redo className="h-4 w-4" />
            <span className="text-gray-30 text-sm">Повторять</span>
          </div>

          {/* Кнопки */}
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
