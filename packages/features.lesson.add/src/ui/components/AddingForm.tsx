import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import { Clock, Account } from '@xipkg/icons';
import { Switcher, SwitcherList, SwitcherTrigger } from '@xipkg/switcher';
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
        className="flex flex-col gap-6"
      >
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-0">
              <FormLabel className="text-[14px] font-normal text-gray-100">Название</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  variant="s"
                  placeholder="Математика"
                  className="border-gray-10 rounded-lg border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="studentId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-[14px] font-normal text-gray-100">Кабинет</FormLabel>
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

        <div className="flex flex-row gap-2">
          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="text-[14px] font-normal text-gray-100">Дата</FormLabel>
                <FormControl>
                  <InputDate {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full" />
        </div>

        <div className="flex flex-col gap-2">
          <FormLabel className="text-[14px] font-normal text-gray-100">
            Начало и длительность урока
          </FormLabel>
          <div className="flex w-full flex-row gap-2">
            <FormField
              control={control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      ref={maskRefStartTime}
                      placeholder="17:40 Начало"
                      className="border-gray-10 rounded-lg border"
                      after={<Clock className="fill-brand-80 h-4 w-4" />}
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
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      ref={maskRefDuration}
                      placeholder="1:20 Длительность"
                      className="border-gray-10 rounded-lg border"
                      after={<Clock className="fill-brand-80 h-4 w-4" />}
                      variant="s"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full flex-row gap-2">
            <FormItem className="w-full">
              <FormControl>
                <Input
                  value={endTimeDisplay}
                  variant="s"
                  after={<Clock className="fill-brand-80 h-4 w-4" />}
                  className="border-gray-10 rounded-lg border"
                />
              </FormControl>
            </FormItem>
            <div className="w-full" />
          </div>
        </div>

        <FormField
          control={control}
          name="repeatMode"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel className="text-[14px] font-normal text-gray-100">Повторение</FormLabel>
              <FormControl>
                <Switcher value={field.value} onValueChange={field.onChange}>
                  <SwitcherList>
                    <SwitcherTrigger value="none">Не повторять</SwitcherTrigger>
                    <SwitcherTrigger value="weekly">Раз в неделю</SwitcherTrigger>
                    <SwitcherTrigger value="custom">Выбрать дни</SwitcherTrigger>
                  </SwitcherList>
                </Switcher>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {children}
      </form>
    </Form>
  );
};
