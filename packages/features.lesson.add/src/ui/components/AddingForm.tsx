import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import { Clock, Account } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { cn } from '@xipkg/utils';
import { useAddingForm } from '../../hooks';
import { InputDate } from './InputDate';
import { StudentSelector } from './StudentSelector';
import { addDurationToTime } from '../../utils/utils';

import { useEffect } from 'react';
import type { FC, PropsWithChildren } from 'react';

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;
import type { FormData } from '../../model';

interface AddingFormProps extends PropsWithChildren {
  onClose: () => void;
  /** Дата для предзаполнения поля «Дата» (например, день колонки при клике на плюс в канбане) */
  initialDate?: Date | null;
  fixedClassroomId?: number;
  onSubmit?: (data: FormData) => void | Promise<void>;
}

export const AddingForm: FC<AddingFormProps> = ({
  children,
  onClose,
  initialDate,
  fixedClassroomId,
  onSubmit: externalSubmit,
}) => {
  const {
    form,
    control,
    handleSubmit,
    handleClearForm,
    onSubmit,
    classrooms,
    isClassroomsLoading,
  } = useAddingForm(initialDate, { fixedClassroomId, onSubmit: externalSubmit });

  useEffect(() => {
    if (initialDate != null) {
      form.setValue('startDate', initialDate);
    }
  }, [initialDate, form]);

  useEffect(() => {
    if (fixedClassroomId != null) {
      form.setValue('studentId', String(fixedClassroomId));
    }
  }, [fixedClassroomId, form]);

  const maskRefStartTime = useMaskInput('time');
  const maskRefDuration = useMaskInput('time');

  const startTime = form.watch('startTime');
  const duration = form.watch('duration');
  const repeatMode = form.watch('repeatMode');
  const fixedClassroom = classrooms.find((classroom) => classroom.id === fixedClassroomId);
  const endTimeDisplay =
    startTime && duration && /^\d{1,2}:\d{2}$/.test(startTime) && /^\d{1,2}:\d{2}$/.test(duration)
      ? addDurationToTime(startTime, duration)
      : '—';

  const handleReset = () => {
    handleClearForm();
    onClose();
  };

  const onFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form
        id="adding-lesson-form"
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
                {fixedClassroomId != null ? (
                  <Input
                    value={fixedClassroom?.name ?? 'Текущий кабинет'}
                    disabled
                    variant="s"
                    className="border-gray-10 rounded-lg border"
                    before={<Account className="fill-gray-80 h-4 w-4" />}
                  />
                ) : (
                  <StudentSelector
                    {...field}
                    classrooms={classrooms}
                    isLoading={isClassroomsLoading}
                    before={<Account className="fill-gray-80 h-4 w-4" />}
                  />
                )}
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
            <FormItem className="flex flex-col gap-0">
              <div className="flex items-center gap-2 py-1">
                <FormControl>
                  <Toggle
                    id="repeat-mode"
                    checked={field.value !== 'none'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'custom' : 'none')}
                    size="s"
                  />
                </FormControl>
                <FormLabel htmlFor="repeat-mode" className="text-[14px] font-normal text-gray-100">
                  Повторение
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {repeatMode !== 'none' && (
          <FormField
            control={control}
            name="repeatDays"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-[14px] font-normal text-gray-100">
                  Повторять занятие каждую неделю в выбранные дни:
                </FormLabel>
                <FormControl>
                  <div className="flex flex-row flex-wrap gap-2">
                    {WEEKDAY_LABELS.map((label, index) => {
                      const value = field.value ?? [];
                      const isSelected = value.includes(index);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? value.filter((d) => d !== index)
                              : [...value, index].sort((a, b) => a - b);
                            field.onChange(next);
                          }}
                          className={cn(
                            'flex h-[48px] min-w-[36px] shrink-0 items-center justify-center rounded-lg px-3 text-center text-sm font-medium transition-colors',
                            !isSelected && 'hover:bg-gray-10 hover:text-gray-80',
                          )}
                          style={{
                            backgroundColor: isSelected ? 'var(--xi-brand-80)' : 'transparent',
                            color: isSelected ? 'var(--xi-gray-0)' : 'var(--xi-gray-60)',
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {children}
      </form>
    </Form>
  );
};
