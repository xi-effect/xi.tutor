import { create } from 'zustand';
import { EventFormData } from '../model';
import { ICalendarEvent } from '../ui/types';

interface FormEventStore {
  isOpen: boolean;
  defaultFormValues: EventFormData;
  activeEventId: string;
  paid: boolean;
  complete: boolean;
  openForm: (calendarEvent?: ICalendarEvent) => void;
  closeForm: () => void;
}

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}.${mm}.${yyyy}`;
};

const INITIAL_VALUES: EventFormData = {
  title: '',
  type: 'rest',
  startTime: '',
  endTime: '',
  isAllDay: false,
  startDate: formatDate(new Date()),
  shouldRepeat: 'dont_repeat',
};

const useFormEventStore = create<FormEventStore>((set) => ({
  isOpen: false,
  defaultFormValues: INITIAL_VALUES,
  activeEventId: '',
  paid: true,
  complete: false,

  openForm: (calendarEvent) => {
    if (!calendarEvent) {
      set({ isOpen: true });
      return;
    }

    const startDateDefault = formatDate(calendarEvent.start);
    const endDateDefault = formatDate(calendarEvent.end);

    const defaultValues: EventFormData = {
      title: calendarEvent.title,
      type: calendarEvent.type || 'rest',
      startTime: calendarEvent.start.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: calendarEvent.end.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isAllDay: calendarEvent.isAllDay || false,
      shouldRepeat: 'dont_repeat',
      startDate: startDateDefault,
      endDate: endDateDefault,
      studentId: '',
      subjectName: calendarEvent.lessonInfo?.subject || '',
      lessonType: calendarEvent.lessonInfo?.lessonType || 'individual',
      description: calendarEvent.lessonInfo?.description || '',
    };

    set({
      isOpen: true,
      defaultFormValues: defaultValues,
      activeEventId: calendarEvent.id,
      paid: calendarEvent.lessonInfo?.paid,
      complete: calendarEvent.lessonInfo?.complete,
    });
  },

  closeForm: () => {
    set({ isOpen: false, defaultFormValues: INITIAL_VALUES });
  },
}));

export const useIsOpen = () => {
  return useFormEventStore((state) => state.isOpen);
};

export const useActiveEventId = () => {
  return useFormEventStore((state) => state.activeEventId);
};

export const useLessonStatuses = () => {
  const paid = useFormEventStore((state) => state.paid);
  const complete = useFormEventStore((state) => state.complete);
  return { paid, complete };
};

export const useDefaultValues = () => {
  return useFormEventStore((state) => state.defaultFormValues);
};

export const useOpenForm = () => {
  return useFormEventStore((state) => state.openForm);
};

export const useCloseForm = () => {
  return useFormEventStore((state) => state.closeForm);
};
