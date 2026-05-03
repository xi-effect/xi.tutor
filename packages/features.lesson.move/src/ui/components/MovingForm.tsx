import { useEffect, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { UserProfile } from '@xipkg/userprofile';
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
import { useMaskInput } from '@xipkg/inputmask';
import { ArrowRight, Clock, InfoCircle } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useLessonClassroomPresentation } from 'modules.calendar';
import {
  useMovingForm,
  type RepeatedVirtualRescheduleTarget,
  type SoleRescheduleTarget,
} from '../../hooks';
import type { FormData } from '../../model';
import {
  formatDurationBetweenRu,
  getDayMonthRu,
  getShortDateString,
  WEEKDAY_FULL_NAMES,
} from '../../utils/utils';
import { InputDate } from './InputDate';

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export type MovingFormProps = PropsWithChildren<{
  onClose: () => void;
  initialDate?: Date | null;
  initialStartTime?: string | null;
  initialEndTime?: string | null;
  lessonKind: 'one-off' | 'recurring';
  /** id кабинета для отображения названия, предмета и аватара через useLessonClassroomPresentation */
  classroomId?: number;
  /** id пользователя (репетитор/студент) — запасной аватар если кабинет не загружен */
  teacherId?: number;
  /** Запасное название кабинета до загрузки данных */
  fallbackName?: string;
  lessonTitle: string;
  lessonDescription?: string;
  /** День недели серии (0 — пн), для текста подсказки в режиме «Это занятие» */
  seriesWeekdayIndex?: number;
  /**
   * Параметры для переноса виртуального повторяющегося инстанса.
   * Когда задан и `onSubmit` не передан — вызывается PUT reschedule API.
   */
  schedulerTarget?: RepeatedVirtualRescheduleTarget;
  /**
   * Параметры для переноса инстанса с явным id (sole / repeated_persisted).
   * Когда задан и `onSubmit` не передан — вызывается PUT /event-instances/{id}/time-slot/.
   */
  soleTarget?: SoleRescheduleTarget;
  onSubmit?: (data: FormData) => void | Promise<void>;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}>;

function buildInfoText(
  moveMode: 'single' | 'single_and_next' | undefined,
  startDate: Date,
  startTime: string,
  endTime: string,
  repeatWeekdays: number[],
  seriesWeekdayIndex: number,
): string {
  const dateStr = getDayMonthRu(startDate);
  const repeatPart =
    moveMode === 'single_and_next'
      ? (() => {
          const sorted = [...repeatWeekdays].sort((a, b) => a - b);
          if (sorted.length === 1) {
            return `будут повторяться каждый ${WEEKDAY_FULL_NAMES[sorted[0]!]}`;
          }
          return `будут повторяться по дням: ${sorted.map((i) => WEEKDAY_FULL_NAMES[i]).join(', ')}`;
        })()
      : `будут повторяться каждый ${WEEKDAY_FULL_NAMES[seriesWeekdayIndex] ?? WEEKDAY_FULL_NAMES[0]}`;

  return `С ${dateStr} занятия будут начинаться в ${startTime}, конец в ${endTime}, ${repeatPart}`;
}

export const MovingForm: FC<MovingFormProps> = ({
  children,
  onClose,
  initialDate,
  initialStartTime,
  initialEndTime,
  lessonKind,
  classroomId,
  teacherId,
  fallbackName = '',
  lessonTitle,
  lessonDescription,
  seriesWeekdayIndex = 0,
  schedulerTarget,
  soleTarget,
  onSubmit: externalSubmit,
  onSubmittingChange,
}) => {
  const { form, control, handleSubmit, handleClearForm, onSubmit } = useMovingForm(
    lessonKind,
    initialDate,
    initialStartTime,
    initialEndTime,
    { onSubmit: externalSubmit, schedulerTarget, soleTarget },
  );

  const { isSubmitting } = useFormState({ control });

  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  useEffect(() => {
    if (initialDate != null) {
      form.setValue('startDate', initialDate);
    }
  }, [initialDate, form]);

  useEffect(() => {
    if (initialStartTime) {
      form.setValue('startTime', initialStartTime);
    }
    if (initialEndTime) {
      form.setValue('endTime', initialEndTime);
    }
  }, [initialStartTime, initialEndTime, form]);

  const maskRefStartTime = useMaskInput('time');
  const maskRefEndTime = useMaskInput('time');

  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const moveMode = form.watch('moveMode');
  const startDate = form.watch('startDate');
  const repeatWeekdays = form.watch('repeatWeekdays');

  const sourceDate = initialDate ?? startDate;

  const durationLabel = useMemo(
    () => formatDurationBetweenRu(startTime, endTime),
    [startTime, endTime],
  );

  const showSwitcher = lessonKind === 'recurring';
  const showDateArrow = lessonKind === 'one-off' || moveMode !== 'single_and_next';
  const showRepetitions = lessonKind === 'recurring' && moveMode === 'single_and_next';
  const showInfoBanner = lessonKind === 'recurring';

  const infoText = useMemo(
    () =>
      showInfoBanner
        ? buildInfoText(
            moveMode,
            startDate,
            startTime,
            endTime,
            repeatWeekdays ?? [],
            seriesWeekdayIndex,
          )
        : null,
    [showInfoBanner, moveMode, startDate, startTime, endTime, repeatWeekdays, seriesWeekdayIndex],
  );

  const { classroomName, avatarUserId, subjectName } = useLessonClassroomPresentation({
    classroomId,
    fallbackClassroomName: fallbackName,
    fallbackAvatarUserId: teacherId,
  });

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
        id="moving-lesson-form"
        onSubmit={handleSubmit(onFormSubmit)}
        onReset={handleReset}
        className="flex w-full min-w-0 flex-col gap-4"
      >
        <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
          <UserProfile
            size="m"
            userId={avatarUserId ?? 0}
            withOutText
            className="row-start-1 self-center"
          />
          <div className="row-start-1 flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="text-md-base leading-snug font-medium text-gray-100">
              {classroomName}
            </span>
            {subjectName ? (
              <span className="bg-gray-10 text-gray-80 shrink-0 rounded-full px-2.5 py-1 text-xs leading-none font-medium">
                {subjectName}
              </span>
            ) : null}
          </div>
          <p className="col-span-2 row-start-2 mt-5 text-base leading-snug font-semibold text-gray-100">
            {lessonTitle}
          </p>
          {lessonDescription ? (
            <p className="text-gray-60 col-span-2 row-start-3 mt-1 text-sm leading-normal">
              {lessonDescription}
            </p>
          ) : null}
        </div>

        {showSwitcher && (
          <FormField
            control={control}
            name="moveMode"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormControl>
                  <div className="bg-gray-5 flex w-full max-w-md items-center rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => field.onChange('single')}
                      className={cn(
                        'min-w-0 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        field.value === 'single'
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
                        'min-w-0 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        field.value === 'single_and_next'
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
        )}

        <div className="flex flex-col gap-2">
          <FormLabel className="text-[14px] font-normal text-gray-100">
            {showDateArrow ? 'Дата' : 'Дата начала повторений'}
          </FormLabel>
          {showDateArrow ? (
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
          ) : (
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputDate {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <FormLabel className="text-[14px] font-normal text-gray-100">Время урока</FormLabel>
            {durationLabel ? <span className="text-gray-60 text-sm">{durationLabel}</span> : null}
          </div>
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
              name="endTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      ref={maskRefEndTime}
                      placeholder="19:00 Конец"
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
        </div>

        {showRepetitions && (
          <FormField
            control={control}
            name="repeatWeekdays"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <FormLabel className="text-[14px] font-normal text-gray-100">
                    Повторения
                  </FormLabel>
                  <span className="text-gray-60 inline-flex items-center gap-1 text-xs">
                    Можно редактировать
                    <InfoCircle className="fill-gray-40 h-3.5 w-3.5 shrink-0" aria-hidden />
                  </span>
                </div>
                <FormControl>
                  <div className="flex flex-row flex-wrap gap-2">
                    {WEEKDAY_LABELS.map((label, index) => {
                      const value = field.value ?? [];
                      const isSelected = value.includes(index);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? value.filter((d) => d !== index)
                              : [...value, index].sort((a, b) => a - b);
                            field.onChange(next);
                          }}
                          className={cn(
                            'flex h-11 min-w-[36px] shrink-0 items-center justify-center rounded-lg px-3 text-center text-sm font-medium transition-colors',
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

        {showInfoBanner && infoText ? (
          <div
            className="border-brand-40 bg-brand-0 flex gap-2 rounded-lg border p-3 text-sm leading-snug text-gray-100"
            role="status"
          >
            <InfoCircle className="fill-brand-80 mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{infoText}</p>
          </div>
        ) : null}

        {children}
      </form>
    </Form>
  );
};
