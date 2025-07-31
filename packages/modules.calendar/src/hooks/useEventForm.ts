import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect } from 'react';
import { eventFormSchema, type EventFormData } from '../model';
import { students } from '../mocks';
import type { ICalendarEvent } from '../ui/types';

export const useEventForm = (calendarEvent?: ICalendarEvent) => {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: calendarEvent?.title || '',
      type:
        calendarEvent?.type === 'lesson' || calendarEvent?.type === 'rest'
          ? calendarEvent.type
          : 'rest',
      studentId: '',
      subjectName: '',
      lessonType: 'individual',
      description: '',
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
  const selectedStartTime = watch('startTime');
  const selectedEndTime = watch('endTime');
  const isAllDay = watch('isAllDay');

  // Автоматическое изменение времени при включении режима "весь день"
  useEffect(() => {
    if (isAllDay) {
      setValue('startTime', '00:00');
      setValue('endTime', '23:59');
    }
  }, [isAllDay, setValue]);

  const duration = useMemo(() => {
    if (!selectedStartTime || !selectedEndTime) return { hours: 0, minutes: 0 };
    const [startHours, startMinutes] = selectedStartTime.split(':').map(Number);
    const [endHours, endMinutes] = selectedEndTime.split(':').map(Number);
    const duration = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    return { hours: Math.floor(duration / 60), minutes: duration % 60 };
  }, [selectedStartTime, selectedEndTime]);

  // Очистка полей при смене типа события
  const handleTypeChange = (newType: 'lesson' | 'rest') => {
    setValue('type', newType);

    if (newType === 'rest') {
      setValue('studentId', '');
      setValue('subjectName', '');
      setValue('lessonType', 'individual');
      setValue('description', '');
    }
  };

  const handleStudentChange = (newId: string) => {
    setValue('studentId', newId);

    const selectedStudent = students.find((student) => student.id === newId);

    setValue('subjectName', selectedStudent?.subject.name || '');
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
    duration,
    isAllDay,
    handleTypeChange,
    handleStudentChange,
    onSubmit,
  };
};
