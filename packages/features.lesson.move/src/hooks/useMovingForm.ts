import { useMemo } from 'react';
import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRescheduleRepeatedVirtualInstance } from 'modules.calendar';
import { createMovingFormSchema, type FormData, type FormInput } from '../model/formSchema';
import { timeToMinutes } from '../utils/utils';

/** Параметры для переноса виртуального повторяющегося инстанса */
export type RepeatedVirtualRescheduleTarget = {
  classroomId: number;
  repetitionModeId: string;
  instanceIndex: number;
};

type UseMovingFormOptions = {
  onSubmit?: (data: FormData) => void | Promise<void>;
  /** Если передан — при сабмите вызывается PUT reschedule для repeated_virtual */
  schedulerTarget?: RepeatedVirtualRescheduleTarget;
};

const getDefaultValues = (
  lessonKind: 'one-off' | 'recurring',
  initialDate?: Date | null,
  initialStartTime?: string | null,
  initialEndTime?: string | null,
): FormInput => {
  const startDate = initialDate ?? new Date();
  return {
    startDate,
    startTime: initialStartTime ?? '',
    endTime: initialEndTime ?? '',
    moveMode: lessonKind === 'recurring' ? 'single' : undefined,
    repeatWeekdays: lessonKind === 'recurring' ? [0] : [],
  };
};

function buildStartsAt(startDate: Date, startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const d = new Date(startDate);
  d.setHours(hours!, minutes!, 0, 0);
  return d.toISOString();
}

function buildDurationSeconds(startTime: string, endTime: string): number {
  return (timeToMinutes(endTime) - timeToMinutes(startTime)) * 60;
}

export const useMovingForm = (
  lessonKind: 'one-off' | 'recurring',
  initialDate?: Date | null,
  initialStartTime?: string | null,
  initialEndTime?: string | null,
  options: UseMovingFormOptions = {},
) => {
  const { onSubmit: externalSubmit, schedulerTarget } = options;
  const schema = useMemo(() => createMovingFormSchema(lessonKind), [lessonKind]);
  const reschedule = useRescheduleRepeatedVirtualInstance();

  const form = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: getDefaultValues(lessonKind, initialDate, initialStartTime, initialEndTime),
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: FormData) => {
    if (externalSubmit) {
      await externalSubmit(data);
      return;
    }

    if (schedulerTarget) {
      await reschedule.mutateAsync({
        classroomId: schedulerTarget.classroomId,
        repetitionModeId: schedulerTarget.repetitionModeId,
        instanceIndex: schedulerTarget.instanceIndex,
        body: {
          starts_at: buildStartsAt(data.startDate, data.startTime),
          duration_seconds: buildDurationSeconds(data.startTime, data.endTime),
        },
      });
      toast.success('Занятие перенесено');
      return;
    }

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
