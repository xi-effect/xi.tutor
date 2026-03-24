import { useEffect } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import { ArrowRight, Clock, Account } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useMovingForm } from '../../hooks';
import type { FormData } from '../../model';
import { addDurationToTime, getShortDateString } from '../../utils/utils';
import { InputDate } from './InputDate';
import { StudentSelector } from './StudentSelector';

interface MovingFormProps extends PropsWithChildren {
  onClose: () => void;
  initialDate?: Date | null;
}

export const MovingForm: FC<MovingFormProps> = ({ children, onClose, initialDate }) => {
  const {
    form,
    control,
    handleSubmit,
    handleClearForm,
    onSubmit,
    classrooms,
    isClassroomsLoading,
  } = useMovingForm(initialDate);

  useEffect(() => {
    if (initialDate != null) {
      form.setValue('startDate', initialDate);
    }
  }, [initialDate, form]);

  const maskRefStartTime = useMaskInput('time');
  const maskRefDuration = useMaskInput('time');
  const startTime = form.watch('startTime');
  const duration = form.watch('duration');
  const moveMode = form.watch('moveMode');
  const sourceDate = initialDate ?? form.watch('startDate');

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
        id="moving-lesson-form"
        onSubmit={handleSubmit(onFormSubmit)}
        onReset={handleReset}
        className="flex w-full min-w-0 flex-col gap-6"
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

        <div className="flex flex-col gap-2">
          <FormLabel className="text-[14px] font-normal text-gray-100">Дата</FormLabel>
          <div className="flex w-full flex-row gap-2">
            <FormItem className="w-full">
              <FormControl>
                <Input
                  value={sourceDate ? getShortDateString(sourceDate) : ''}
                  readOnly
                  variant="s"
                  className="border-gray-10 rounded-lg border"
                  after={<ArrowRight className="fill-brand-80 h-4 w-4" />}
                />
              </FormControl>
            </FormItem>
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <InputDate {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FormLabel className="text-[14px] font-normal text-gray-100">Время урока</FormLabel>
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
                  value={`${endTimeDisplay} Конец`}
                  readOnly
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
          name="moveMode"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel className="text-[14px] font-normal text-gray-100">Перенести</FormLabel>
              <FormControl>
                <div className="bg-gray-5 flex w-fit items-center rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => field.onChange('single')}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      moveMode === 'single'
                        ? 'bg-brand-80 text-gray-0'
                        : 'text-gray-80 hover:bg-gray-10',
                    )}
                  >
                    Это занятие
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange('single_and_next')}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      moveMode === 'single_and_next'
                        ? 'bg-brand-80 text-gray-0'
                        : 'text-gray-80 hover:bg-gray-10',
                    )}
                  >
                    Это и следующие
                  </button>
                </div>
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
