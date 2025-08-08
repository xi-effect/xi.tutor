import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect } from 'react';
import { eventFormSchema, type EventFormData } from '../model';
import type { StudentT } from '../mocks';
import type { ICalendarEvent } from '../ui/types';

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

export const useEventForm = (calendarEvent?: ICalendarEvent) => {
  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    return `${dd}.${mm}.${yyyy}`;
  };

  const startDateDefault = calendarEvent?.start
    ? formatDate(calendarEvent.start)
    : formatDate(new Date());
  const endDateDefault = calendarEvent?.end ? formatDate(calendarEvent.end) : startDateDefault;
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: calendarEvent?.title || '',
      type:
        calendarEvent?.type === 'lesson' || calendarEvent?.type === 'rest'
          ? calendarEvent.type
          : 'rest',
      startTime:
        calendarEvent?.start?.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }) || '',
      endTime:
        calendarEvent?.end?.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }) || '',
      isAllDay: false,
      startDate: startDateDefault,
      endDate: endDateDefault,
      studentId: '',
      subjectName: '',
      lessonType: 'individual',
      description: '',
      paymentStatus: 'paid',
      lessonStatus: 'not_done',
    },
  });

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const selectedType = watch('type');

  const handleTypeChange = (newType: 'lesson' | 'rest') => {
    setValue('type', newType);
    if (newType === 'rest') {
      setValue('studentId', '');
      setValue('subjectName', '');
      setValue('lessonType', 'individual');
      setValue('description', '');
    }
  };

  const onSubmit = (data: EventFormData) => {
    console.log('event form data: ', data);
  };

  return {
    form,
    control,
    handleSubmit,
    errors,
    selectedType,
    handleTypeChange,
    onSubmit,
  };
};
