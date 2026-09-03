import { useMemo } from 'react';
import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createFormSchema, type FormData, type FormInput } from '../model/formSchema';
import { useFetchClassrooms, useCreateClassroomEvent } from 'common.services';
import type { ProductAnalyticsLessonType, ProductAnalyticsSource } from 'common.utils';
import { buildCreateClassroomEventRequest } from '../utils/buildCreateClassroomEventRequest';

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
  repeatEnds: 'never',
  repeatUntil: null,
});

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
    const body = buildCreateClassroomEventRequest(data);

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
