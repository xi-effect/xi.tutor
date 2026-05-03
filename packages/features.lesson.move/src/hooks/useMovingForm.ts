import { useMemo } from 'react';
import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  useRescheduleRepeatedVirtualInstance,
  useRescheduleSoleEventInstance,
} from 'modules.calendar';
import { createMovingFormSchema, type FormData, type FormInput } from '../model/formSchema';
import { timeToMinutes } from '../utils/utils';

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
  const { onSubmit: externalSubmit, schedulerTarget, soleTarget } = options;
  const schema = useMemo(() => createMovingFormSchema(lessonKind), [lessonKind]);
  const reschedule = useRescheduleRepeatedVirtualInstance();
  const rescheduleSole = useRescheduleSoleEventInstance();

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

    const timeSlotBody = {
      starts_at: buildStartsAt(data.startDate, data.startTime),
      duration_seconds: buildDurationSeconds(data.startTime, data.endTime),
    };

    if (schedulerTarget) {
      await reschedule.mutateAsync({
        classroomId: schedulerTarget.classroomId,
        repetitionModeId: schedulerTarget.repetitionModeId,
        instanceIndex: schedulerTarget.instanceIndex,
        body: timeSlotBody,
      });
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
