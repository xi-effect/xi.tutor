import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useFormState,
} from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Textarea } from '@xipkg/textarea';
import { Account } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { useAddingForm } from '../../hooks';
import { InputDate } from './InputDate';
import { StudentSelector } from './StudentSelector';
import { formatDurationBetween, resolveSyncedEndTime } from '../../utils';
import { TimeInput } from './TimeInput';

import { useEffect, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';
import type { FormData } from '../../model';
import type { ProductAnalyticsSource } from 'common.utils';

interface AddingFormProps extends PropsWithChildren {
  onClose: () => void;
  /** Дата для предзаполнения поля «Дата» (например, день колонки при клике на плюс в канбане) */
  initialDate?: Date | null;
  fixedClassroomId?: number;
  onSubmit?: (data: FormData) => void | Promise<void>;
  analyticsSource?: ProductAnalyticsSource;
  /** Состояние отправки формы (для лоадера на кнопках в модалке) */
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export const AddingForm: FC<AddingFormProps> = ({
  children,
  onClose,
  initialDate,
  fixedClassroomId,
  onSubmit: externalSubmit,
  analyticsSource,
  onSubmittingChange,
}) => {
  const { t } = useTranslation('lessonAdd');
  const {
    form,
    control,
    handleSubmit,
    handleClearForm,
    onSubmit,
    classrooms,
    isClassroomsLoading,
  } = useAddingForm(initialDate, { fixedClassroomId, onSubmit: externalSubmit, analyticsSource });

  const { isSubmitting } = useFormState({ control });
  const weekdayLabels = useMemo(() => t('weekdays_short').split(','), [t]);

  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

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

  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const repeatMode = form.watch('repeatMode');
  const startDate = form.watch('startDate');
  const fixedClassroom = classrooms.find((classroom) => classroom.id === fixedClassroomId);
  const durationLabel = useMemo(
    () => formatDurationBetween(startTime, endTime, t),
    [startTime, endTime, t],
  );

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
        className="flex w-full min-w-0 flex-col gap-4"
      >
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-0">
              <FormLabel className="text-text-primary text-[14px] font-normal">
                {t('form.name')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  variant="s"
                  placeholder={t('form.namePlaceholder')}
                  className="border-border-default rounded-lg border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-0">
              <FormLabel className="text-text-primary text-[14px] font-normal">
                {t('form.description')}
              </FormLabel>
              <FormControl>
                <Textarea
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  placeholder={t('form.descriptionPlaceholder')}
                  maxLength={4000}
                  maxRows={5}
                  hideCounter
                  className="border-border-default placeholder:text-text-disabled text-text-primary min-h-[88px] resize-y rounded-lg border px-3 py-2 text-sm"
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
              <FormLabel className="text-text-primary text-[14px] font-normal">
                {t('form.classroom')}
              </FormLabel>
              <FormControl>
                {fixedClassroomId != null ? (
                  <Input
                    value={fixedClassroom?.name ?? t('form.currentClassroom')}
                    disabled
                    variant="s"
                    className="border-border-default rounded-lg border"
                    before={<Account className="fill-icon-primary h-4 w-4" />}
                  />
                ) : (
                  <StudentSelector
                    {...field}
                    classrooms={classrooms}
                    isLoading={isClassroomsLoading}
                    before={<Account className="fill-icon-primary h-4 w-4" />}
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
                <FormLabel className="text-text-primary text-[14px] font-normal">
                  {t('form.date')}
                </FormLabel>
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
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <FormLabel className="text-text-primary text-[14px] font-normal">
              {t('form.time')}
            </FormLabel>
            {durationLabel ? (
              <span className="text-text-secondary text-sm">{durationLabel}</span>
            ) : null}
          </div>
          <div className="flex w-full flex-row gap-2">
            <FormField
              control={control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <TimeInput
                      name={field.name}
                      value={field.value}
                      onBlur={field.onBlur}
                      placeholder={t('form.startPlaceholder')}
                      onChange={(nextStart) => {
                        field.onChange(nextStart);
                        const nextEnd = resolveSyncedEndTime(nextStart, form.getValues('endTime'));
                        if (nextEnd) {
                          form.setValue('endTime', nextEnd, { shouldValidate: true });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <TimeInput
                      name={field.name}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      placeholder={t('form.endPlaceholder')}
                      minTime={startTime}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                <FormLabel
                  htmlFor="repeat-mode"
                  className="text-text-primary text-[14px] font-normal"
                >
                  {t('form.repeat')}
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
                <FormLabel className="text-text-primary text-[14px] font-normal">
                  {t('form.repeatHint')}
                </FormLabel>
                <FormControl>
                  <div className="flex flex-row flex-wrap gap-2">
                    {weekdayLabels.map((label, index) => {
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
                            !isSelected && 'hover:bg-background-subtle hover:text-text-primary',
                          )}
                          style={{
                            backgroundColor: isSelected
                              ? 'var(--xi-action-primary-background-default)'
                              : 'transparent',
                            color: isSelected
                              ? 'var(--xi-text-on-accent)'
                              : 'var(--xi-text-secondary)',
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

        {repeatMode !== 'none' && (
          <FormField
            control={control}
            name="repeatEnds"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-text-primary text-[14px] font-normal">
                  {t('form.repeatEnds')}
                </FormLabel>
                <FormControl>
                  <div role="radiogroup" className="flex flex-col gap-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="repeatEnds"
                        checked={field.value === 'never'}
                        onChange={() => {
                          field.onChange('never');
                          form.setValue('repeatUntil', null);
                        }}
                        className="accent-action-primary-background-default h-4 w-4"
                      />
                      <span className="text-text-primary text-sm">{t('form.repeatEndsNever')}</span>
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="repeatEnds"
                          checked={field.value === 'date'}
                          onChange={() => {
                            field.onChange('date');
                            if (form.getValues('repeatUntil') == null) {
                              form.setValue('repeatUntil', startDate);
                            }
                          }}
                          className="accent-action-primary-background-default h-4 w-4"
                        />
                        <span className="text-text-primary text-sm">
                          {t('form.repeatEndsUntilDate')}
                        </span>
                      </label>
                      {field.value === 'date' ? (
                        <FormField
                          control={control}
                          name="repeatUntil"
                          render={({ field: untilField }) => (
                            <FormItem>
                              <FormControl>
                                <InputDate
                                  value={untilField.value ?? startDate}
                                  onChange={untilField.onChange}
                                  minDate={startDate}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : null}
                    </div>
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
