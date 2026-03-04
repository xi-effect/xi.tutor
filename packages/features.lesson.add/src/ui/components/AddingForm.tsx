import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import { Clock, Account } from '@xipkg/icons';
import { Switch } from '@xipkg/switcher';
import { useAddingForm } from '../../hooks';
import { InputDate } from './InputDate';
import { StudentSelector } from './StudentSelector';
import { addDurationToTime } from '../../utils/utils';

import type { FC, PropsWithChildren } from 'react';
import type { FormData } from '../../model';

interface AddingFormProps extends PropsWithChildren {
  onClose: () => void;
}

export const AddingForm: FC<AddingFormProps> = ({ children, onClose }) => {
  const {
    form,
    control,
    handleSubmit,
    handleClearForm,
    onSubmit,
    classrooms,
    isClassroomsLoading,
  } = useAddingForm();

  const maskRefStartTime = useMaskInput('time');
  const maskRefDuration = useMaskInput('time');

  const startTime = form.watch('startTime');
  const duration = form.watch('duration');
  const endTimeDisplay =
    startTime && duration && /^\d{1,2}:\d{2}$/.test(startTime) && /^\d{1,2}:\d{2}$/.test(duration)
      ? addDurationToTime(startTime, duration)
      : '—';

  const handleReset = () => {
    handleClearForm();
    onClose();
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form
        id="adding-lesson-form"
        onSubmit={handleSubmit(onFormSubmit)}
        onReset={handleReset}
        className="flex flex-col gap-4"
      >
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2 block">Название</FormLabel>
              <FormControl>
                <Input {...field} variant="s" placeholder="Математика" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2 block">Кабинет</FormLabel>
              <FormControl>
                <StudentSelector
                  {...field}
                  classrooms={classrooms}
                  isLoading={isClassroomsLoading}
                  before={<Account className="fill-gray-80 h-4 w-4" />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2 block">Дата</FormLabel>
              <FormControl>
                <InputDate {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="mb-2 block">Начало и длительность урока</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      ref={maskRefStartTime}
                      placeholder="17:40 Начало"
                      before={<Clock className="fill-gray-80 h-4 w-4" />}
                      variant="s"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      ref={maskRefDuration}
                      placeholder="1:20 Длительность"
                      before={<Clock className="fill-gray-80 h-4 w-4" />}
                      variant="s"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2">
              <Input
                readOnly
                value={endTimeDisplay}
                variant="s"
                before={<Clock className="fill-gray-80 h-4 w-4" />}
                className="bg-gray-5 cursor-default"
              />
              <span className="mt-1 block text-xs text-gray-50">Конец</span>
            </div>
          </div>
        </div>

        <FormField
          control={control}
          name="shouldRepeat"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2 py-2">
                <FormControl>
                  <Switch
                    id="repeat-lesson"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    size="s"
                  />
                </FormControl>
                <label htmlFor="repeat-lesson" className="text-gray-80 text-sm font-medium">
                  Повторять занятие
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {children}
      </form>
    </Form>
  );
};
