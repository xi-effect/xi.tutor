import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback } from 'react';
import { useForm } from '@xipkg/form';
import { eventFormSchema, type EventFormData } from '../model';
import { parseDateTime } from '../utils/calendarUtils';
import { useCloseForm, useDefaultValues } from '../store/formEventStore';
import { useAddEvent } from '../store/eventsStore';

import type { StudentT } from '../mocks';
import type { EventType, ICalendarEvent } from '../ui/types';

export const useLessonFields = (form: ReturnType<typeof useForm<EventFormData>>) => {
  const { control, setValue } = form;

  const handleStudentChange = (student: StudentT) => {
    setValue('studentId', student.id);
    setValue('subjectName', student.subject.name || '');
  };

  return {
    control,
    handleStudentChange,
  };
};

export const useDateFields = (form: ReturnType<typeof useForm<EventFormData>>) => {
  const { control, watch, setValue } = form;
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const isAllDay = watch('isAllDay');

  const duration = useMemo(() => {
    if (!startTime || !endTime) return { hours: 0, minutes: 0 };
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const duration = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    return { hours: Math.floor(duration / 60), minutes: duration % 60 };
  }, [startTime, endTime]);

  useEffect(() => {
    if (isAllDay) {
      setValue('startTime', '00:00');
      setValue('endTime', '23:59');
    }
  }, [isAllDay, setValue]);

  return {
    control,
    isAllDay,
    duration,
    startTime,
    endTime,
  };
};

export const useEventForm = () => {
  const addEvent = useAddEvent();
  const handleCloseForm = useCloseForm();
  const defaultFormValues = useDefaultValues();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: defaultFormValues,
  });

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const selectedType = watch('type');

  const handleTypeChange = (newType: EventType) => {
    setValue('type', newType);
    if (newType === 'rest') {
      setValue('studentId', '');
      setValue('subjectName', '');
      setValue('lessonType', 'individual');
      setValue('description', '');
    } else {
      setValue('paymentStatus', 'paid');
      setValue('lessonStatus', 'not_done');
    }
  };

  const onSubmit = useCallback(
    (data: EventFormData) => {
      if (Object.keys(errors).length > 0) {
        console.error('Zod Validation Errors:', errors);
        return;
      }

      const start = parseDateTime(data.startDate, data.startTime);
      const endDateStr = data.endDate && data.endDate.trim() ? data.endDate : data.startDate;
      const end = parseDateTime(endDateStr, data.endTime);

      const event: ICalendarEvent = {
        id: crypto.randomUUID(),
        title: data.title,
        start,
        end,
        type: data.type,
        isAllDay: data.isAllDay,
      };
      if (data.type === 'lesson') {
        event.lessonInfo = {
          studentName: data.studentId,
          subject: data.subjectName,
          lessonType: data.lessonType,
          description: data.description,
        };
      }
      addEvent(event);
      handleCloseForm();
    },
    [addEvent, handleCloseForm, errors],
  );

  return {
    form,
    control,
    errors,
    selectedType,
    handleTypeChange,
    onSubmit,
    handleSubmit,
  };
};
