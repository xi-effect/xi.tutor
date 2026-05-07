import { useEffect, useMemo } from 'react';
import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  useRescheduleRepeatedVirtualInstance,
  useRescheduleSoleEventInstance,
  useCreateLastRepetitionMode,
  bitmaskUtcToLocal,
  bitmaskToWeekdays,
  weekdaysToBitmask,
  toLocalISOString,
} from 'modules.calendar';
import { createMovingFormSchema, type FormData, type FormInput } from '../model/formSchema';
import { timeToMinutes } from '../utils/utils';
import type { MovingRepetitionResolution } from './useMovingRepetitionResolution';

const ALL_REPEAT_WEEKDAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;

function recurringRepeatWeekdaysFromResolution(
  initialDate: Date | null | undefined,
  repetition: MovingRepetitionResolution,
): number[] {
  if (repetition.isDailySeries) {
    return [...ALL_REPEAT_WEEKDAY_INDICES];
  }
  if (repetition.bitmaskUtc != null && initialDate != null) {
    const localBitmask = bitmaskUtcToLocal(repetition.bitmaskUtc, initialDate);
    return bitmaskToWeekdays(localBitmask);
  }
  return [0];
}

/**
 * Выбор ручки переноса (тело везде — EventInstanceTimeSlotInput):
 * - sole → PUT …/event-instances/{event_instance_id}/time-slot/
 * - repeated_persisted → тот же PUT по event_instance_id
 * - repeated_virtual → PUT …/repetition-modes/{repetition_mode_id}/instances/{instance_index}/time-slot/
 *
 * На форме: приоритет `schedulerTarget` (virtual), иначе `soleTarget` (sole / persistent).
 */

/** Параметры для переноса виртуального повторяющегося инстанса (`repeated_virtual`) */
export type RepeatedVirtualRescheduleTarget = {
  classroomId: number;
  /** Числовой id события — нужен для POST last-repetition-mode/ (сценарий «это и следующие») */
  eventId: number;
  repetitionModeId: string;
  instanceIndex: number;
};

/** Параметры для переноса по `event_instance_id` (`sole` или `repeated_persisted`) */
export type SoleRescheduleTarget = {
  classroomId: number;
  eventInstanceId: string;
};

type UseMovingFormOptions = {
  onSubmit?: (data: FormData) => void | Promise<void>;
  /** Перенос repeated_virtual — PUT /repetition-modes/{id}/instances/{n}/time-slot/ */
  schedulerTarget?: RepeatedVirtualRescheduleTarget;
  /** Перенос sole или repeated_persisted — PUT /event-instances/{id}/time-slot/ */
  soleTarget?: SoleRescheduleTarget;
  /**
   * Режим повторений для предзаполнения дней недели (`daily` — все дни, без битмаски).
   * Без значения считается «weekly без данных» (пока не придёт резолвер из модалки).
   */
  movingRepetition?: MovingRepetitionResolution;
};

const getDefaultValues = (
  lessonKind: 'one-off' | 'recurring',
  movingRepetition: MovingRepetitionResolution,
  initialDate?: Date | null,
  initialStartTime?: string | null,
  initialEndTime?: string | null,
): FormInput => {
  const startDate = initialDate ?? new Date();

  let repeatWeekdays: number[] = [];
  if (lessonKind === 'recurring') {
    repeatWeekdays = recurringRepeatWeekdaysFromResolution(initialDate, movingRepetition);
  }

  return {
    startDate,
    startTime: initialStartTime ?? '',
    endTime: initialEndTime ?? '',
    moveMode: lessonKind === 'recurring' ? 'single' : undefined,
    repeatWeekdays,
  };
};

function buildStartsAt(startDate: Date, startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const d = new Date(startDate);
  d.setHours(hours!, minutes!, 0, 0);
  // toLocalISOString сохраняет offset пользователя (например +03:00), не нормализует в UTC
  return toLocalISOString(d);
}

function buildDurationSeconds(startTime: string, endTime: string): number {
  return (timeToMinutes(endTime) - timeToMinutes(startTime)) * 60;
}

/** 0=Пн … 6=Вс — все дни выбраны */
const FULL_WEEK_BITMASK = 0x7f;

const defaultMovingRepetition: MovingRepetitionResolution = {
  isDailySeries: false,
  bitmaskUtc: undefined,
};

export const useMovingForm = (
  lessonKind: 'one-off' | 'recurring',
  initialDate?: Date | null,
  initialStartTime?: string | null,
  initialEndTime?: string | null,
  options: UseMovingFormOptions = {},
) => {
  const {
    onSubmit: externalSubmit,
    schedulerTarget,
    soleTarget,
    movingRepetition: repetitionOption,
  } = options;
  const movingRepetition = repetitionOption ?? defaultMovingRepetition;
  const schema = useMemo(() => createMovingFormSchema(lessonKind), [lessonKind]);
  const reschedule = useRescheduleRepeatedVirtualInstance();
  const rescheduleSole = useRescheduleSoleEventInstance();
  const createLastRepetitionMode = useCreateLastRepetitionMode();

  const form = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: getDefaultValues(
      lessonKind,
      movingRepetition,
      initialDate,
      initialStartTime,
      initialEndTime,
    ),
  });

  const { control, handleSubmit, reset } = form;

  // Догрузка `repetition_mode`, смена даты первого занятия или подсказки из расписания
  useEffect(() => {
    if (lessonKind !== 'recurring') return;
    form.setValue(
      'repeatWeekdays',
      recurringRepeatWeekdaysFromResolution(initialDate, movingRepetition),
    );
  }, [lessonKind, movingRepetition, initialDate, form]);

  const onSubmit = async (data: FormData) => {
    if (externalSubmit) {
      await externalSubmit(data);
      return;
    }

    const timeSlotBody = {
      starts_at: buildStartsAt(data.startDate, data.startTime),
      duration_seconds: buildDurationSeconds(data.startTime, data.endTime),
    };

    if (schedulerTarget) {
      if (data.moveMode === 'single_and_next') {
        const startsAtNext = buildStartsAt(data.startDate, data.startTime);
        const durationNext = buildDurationSeconds(data.startTime, data.endTime);
        const nextWeeklyBitmask = weekdaysToBitmask(data.repeatWeekdays);
        await createLastRepetitionMode.mutateAsync({
          classroomId: schedulerTarget.classroomId,
          eventId: schedulerTarget.eventId,
          body:
            nextWeeklyBitmask === FULL_WEEK_BITMASK
              ? {
                  kind: 'daily',
                  starts_at: startsAtNext,
                  duration_seconds: durationNext,
                }
              : {
                  kind: 'weekly',
                  starts_at: startsAtNext,
                  duration_seconds: durationNext,
                  weekly_bitmask: nextWeeklyBitmask,
                },
        });
      } else {
        await reschedule.mutateAsync({
          classroomId: schedulerTarget.classroomId,
          repetitionModeId: schedulerTarget.repetitionModeId,
          instanceIndex: schedulerTarget.instanceIndex,
          body: timeSlotBody,
        });
      }
      toast.success('Занятие перенесено');
      return;
    }

    if (soleTarget) {
      await rescheduleSole.mutateAsync({
        classroomId: soleTarget.classroomId,
        eventInstanceId: soleTarget.eventInstanceId,
        body: timeSlotBody,
      });
      toast.success('Занятие перенесено');
      return;
    }

    toast.success('Занятие перенесено');
  };

  const handleClearForm = () => {
    reset(
      getDefaultValues(lessonKind, movingRepetition, initialDate, initialStartTime, initialEndTime),
    );
  };

  return {
    form,
    control,
    handleSubmit,
    onSubmit,
    handleClearForm,
  };
};
