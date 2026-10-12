import { create } from 'zustand';
import { getDateLocale } from 'common.ui';
import { getAppNow } from 'common.utils';
import { EventFormData } from '../model';
import { ICalendarEvent } from '../ui/types';
import { formatDate } from '../utils/calendarUtils';

type FormEventStore = {
  isOpen: boolean;
  defaultFormValues: EventFormData;
  activeEventId: string;
  paid: boolean;
  complete: boolean;
  openForm: (calendarEvent?: ICalendarEvent) => void;
  closeForm: () => void;
};

const createInitialValues = (): EventFormData => ({
  title: '',
  type: 'rest',
  startTime: '',
  endTime: '',
  isAllDay: false,
  startDate: formatDate(getAppNow()),
  endDate: formatDate(getAppNow()),
  shouldRepeat: 'dont_repeat',
});

const useFormEventStore = create<FormEventStore>((set) => ({
  isOpen: false,
  defaultFormValues: createInitialValues(),
  activeEventId: '',
  paid: true,
  complete: false,

  openForm: (calendarEvent) => {
    if (!calendarEvent) {
      set({ isOpen: true, defaultFormValues: createInitialValues() });
      return;
    }

    const startDateDefault = formatDate(calendarEvent.start);
    const endDateDefault = formatDate(calendarEvent.end);

    const defaultValues: EventFormData = {
      title: calendarEvent.title,
      type: calendarEvent.type || 'rest',
      startTime: calendarEvent.start.toLocaleTimeString(getDateLocale(), {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: calendarEvent.end.toLocaleTimeString(getDateLocale(), {
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
    set({ isOpen: false, defaultFormValues: createInitialValues() });
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
