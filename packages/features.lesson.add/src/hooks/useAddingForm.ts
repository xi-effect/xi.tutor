import { useMemo } from 'react';
import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createFormSchema, type FormData, type FormInput } from '../model/formSchema';
import { useFetchClassrooms, useCreateClassroomEvent } from 'common.services';
import type { CreateClassroomEventRequestDto } from 'common.api';
import { toLocalISOString } from 'modules.calendar';
import type { ProductAnalyticsLessonType, ProductAnalyticsSource } from 'common.utils';
import { durationBetweenMinutes } from '../utils';

type UseAddingFormOptions = {
  fixedClassroomId?: number;
  onSubmit?: (data: FormData) => void | Promise<void>;
  analyticsSource?: ProductAnalyticsSource;
};

const getDefaultValues = (initialDate?: Date | null, fixedClassroomId?: number): FormInput => ({
  title: '',
  description: '',
  studentId: fixedClassroomId != null ? String(fixedClassroomId) : '',
  startTime: '',
  endTime: '',
  startDate: initialDate ?? new Date(),
  repeatMode: 'none',
  repeatDays: [],
});

/** Объединить дату и строку времени "HH:MM" в ISO-строку с timezone пользователя */
const buildStartsAt = (startDate: Date, startTime: string): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const d = new Date(startDate);
  d.setHours(hours, minutes, 0, 0);
  // toLocalISOString сохраняет offset пользователя (например +03:00), не нормализует в UTC
  return toLocalISOString(d);
};

/** Разница между endTime и startTime в секундах (с учётом перехода через полночь) */
const buildDurationSeconds = (startTime: string, endTime: string): number =>
  durationBetweenMinutes(startTime, endTime) * 60;

/**
 * Биткарта недели: 0=Пн, 1=Вт, ..., 6=Вс → бит 0 = Пн, бит 1 = Вт, ...
 * Если список дней пустой, кладём в маску день из startsAt.
 */
const buildWeeklyBitmask = (days: number[], fallbackDate: Date): number => {
  if (days.length > 0) {
    return days.reduce((mask, day) => mask | (1 << day), 0);
  }
  // js getDay(): 0=Вс, 1=Пн…6=Сб → конвертируем в 0=Пн…6=Вс
  const jsDay = fallbackDate.getDay();
  const day = jsDay === 0 ? 6 : jsDay - 1;
  return 1 << day;
};

/** 0=Пн … 6=Вс — все дни выбраны */
const FULL_WEEK_BITMASK = 0x7f;

const buildRequestBody = (data: FormData): CreateClassroomEventRequestDto => {
  const startsAt = buildStartsAt(data.startDate, data.startTime);
  const durationSeconds = buildDurationSeconds(data.startTime, data.endTime);

  if (data.repeatMode === 'none') {
    return {
      kind: 'single',
      event: {
        name: data.title,
        description: data.description || null,
      },
      sole_instance: {
        starts_at: startsAt,
        duration_seconds: durationSeconds,
      },
    };
  }

  const weeklyBitmask = buildWeeklyBitmask(data.repeatDays, data.startDate);

  return {
    kind: 'repeating',
    event: {
      name: data.title,
      description: data.description || null,
    },
    repetition_mode:
      weeklyBitmask === FULL_WEEK_BITMASK
        ? {
            kind: 'daily',
            starts_at: startsAt,
            duration_seconds: durationSeconds,
          }
        : {
            kind: 'weekly',
            starts_at: startsAt,
            duration_seconds: durationSeconds,
            weekly_bitmask: weeklyBitmask,
          },
  };
};

const resolveLessonType = (
  classrooms: Array<{ id: number; kind?: string }>,
  classroomId: number,
): ProductAnalyticsLessonType => {
  const classroom = classrooms.find((item) => item.id === classroomId);
  if (classroom?.kind === 'individual') return 'individual';
  if (classroom?.kind === 'group') return 'group';
  return 'unknown';
};

export const useAddingForm = (initialDate?: Date | null, options: UseAddingFormOptions = {}) => {
  const { t } = useTranslation('lessonAdd');
  const { data: classrooms, isLoading: isClassroomsLoading } = useFetchClassrooms();
  const { fixedClassroomId, onSubmit: externalSubmit, analyticsSource = 'unknown' } = options;
  const createEvent = useCreateClassroomEvent();
  const formSchema = useMemo(() => createFormSchema(t), [t]);

  const form = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: getDefaultValues(initialDate, fixedClassroomId),
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: FormData) => {
    if (externalSubmit) {
      await externalSubmit(data);
      return;
    }

    const classroomId = Number(data.studentId);
    const body = buildRequestBody(data);

    await createEvent.mutateAsync({
      classroomId,
      body,
      analytics: {
        source: analyticsSource,
        lesson_type: resolveLessonType(classrooms ?? [], classroomId),
        is_recurring: data.repeatMode !== 'none',
        has_description: Boolean(data.description?.trim()),
      },
    });
    toast.success(t('toast.success'));
  };

  const handleClearForm = () => {
    reset(getDefaultValues(initialDate, fixedClassroomId));
  };

  return {
    form,
    control,
    handleSubmit,
    onSubmit,
    handleClearForm,
    classrooms: classrooms ?? [],
    isClassroomsLoading,
  };
};
