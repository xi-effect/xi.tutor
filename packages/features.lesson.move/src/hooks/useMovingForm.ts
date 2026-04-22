import { useMemo } from 'react';
import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createMovingFormSchema, type FormData, type FormInput } from '../model/formSchema';

const getDefaultValues = (
  lessonKind: 'one-off' | 'recurring',
  initialDate?: Date | null,
  initialStartTime?: string | null,
  initialEndTime?: string | null,
): FormInput => {
  const startDate = initialDate ?? new Date();
  return {
    startDate,
    startTime: initialStartTime ?? '17:40',
    endTime: initialEndTime ?? '19:00',
    moveMode: lessonKind === 'recurring' ? 'single' : undefined,
    repeatWeekdays: lessonKind === 'recurring' ? [0] : [],
  };
};

export const useMovingForm = (
  lessonKind: 'one-off' | 'recurring',
  initialDate?: Date | null,
  initialStartTime?: string | null,
  initialEndTime?: string | null,
) => {
  const schema = useMemo(() => createMovingFormSchema(lessonKind), [lessonKind]);

  const form = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: getDefaultValues(lessonKind, initialDate, initialStartTime, initialEndTime),
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = (data: FormData) => {
    const payload = {
      startDate: data.startDate,
      startTime: data.startTime,
      endTime: data.endTime,
      ...(lessonKind === 'recurring' && data.moveMode
        ? {
            moveMode: data.moveMode,
            repeatWeekdays: data.moveMode === 'single_and_next' ? data.repeatWeekdays : undefined,
          }
        : {}),
    };

    console.log('move payload', payload);

    // TODO: подключить API переноса урока
    toast.success('Занятие перенесено');
  };

  const handleClearForm = () => {
    reset(getDefaultValues(lessonKind, initialDate, initialStartTime, initialEndTime));
  };

  return {
    form,
    control,
    handleSubmit,
    onSubmit,
    handleClearForm,
  };
};
