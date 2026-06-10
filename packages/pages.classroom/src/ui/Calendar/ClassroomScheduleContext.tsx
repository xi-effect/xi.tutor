import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { startOfDay } from 'date-fns';
import type { ICalendarEvent } from 'modules.calendar';
import { useCalendar } from 'modules.calendar';
import {
  parseScheduleAnchorFromSearch,
  useClassroomScheduleDeepLink,
} from './useClassroomScheduleDeepLink';
import { useClassroomScheduleSearch } from './useClassroomScheduleSearch';

type ClassroomScheduleContextValue = {
  weekDays: Date[];
  weekStart: Date;
  visibleDays: Date[];
  visibleDayCount: number;
  setVisibleCount: (count: number) => void;
  goToPrev: (count: number) => void;
  goToNext: (count: number) => void;
  goToWeekStart: (date: Date) => void;
  goToVisibleWindowForDate: (date: Date, visibleCount: number) => void;
  /** Переход к окну, начинающемуся с указанной даты — для диплинков (без округления до пн) */
  goToDay: (date: Date) => void;
  onAddLessonClick?: (date?: Date) => void;
  /** Событие из API — открыть в модалке немедленно */
  pendingEventToOpen: ICalendarEvent | null;
  /** Дата занятия — переключить неделю */
  pendingAnchorDate: Date | null;
  /** Меняется при каждом диплинке — чтобы goToDay сработал повторно */
  pendingAnchorToken: number;
  acknowledgePendingLessonOpen: () => void;
  acknowledgeAnchorNavigation: () => void;
  mobileScheduleAnchorTs: number | null;
};

const ClassroomScheduleContext = createContext<ClassroomScheduleContextValue | null>(null);

function resolveDeepLinkAnchorDate(
  pendingAnchorDate: Date | null,
  pendingEventToOpen: ICalendarEvent | null,
): Date | null {
  if (pendingAnchorDate != null) {
    const d = startOfDay(pendingAnchorDate);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (pendingEventToOpen?.start != null) {
    const d = startOfDay(new Date(pendingEventToOpen.start));
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

// eslint-disable-next-line react-refresh/only-export-components -- хук и провайдер в одном модуле
export const useClassroomSchedule = () => {
  const ctx = useContext(ClassroomScheduleContext);
  if (!ctx) {
    throw new Error('useClassroomSchedule must be used within ClassroomScheduleProvider');
  }
  return ctx;
};

type ClassroomScheduleProviderProps = {
  children: ReactNode;
  onAddLessonClick?: (date?: Date) => void;
};

export const ClassroomScheduleProvider = ({
  children,
  onAddLessonClick,
}: ClassroomScheduleProviderProps) => {
  const search = useClassroomScheduleSearch();

  const initialAnchorDate = useMemo(() => parseScheduleAnchorFromSearch(search), [search]);
  const hasInitialAnchor = initialAnchorDate != null;

  const {
    weekDays,
    weekStart,
    goToPrev,
    goToNext,
    goToWeekStart,
    goToDay,
    goToVisibleWindowForDate,
    syncWeekStartForVisibleCount,
  } = useCalendar({
    initialAnchorDate,
    initialAnchorUseDay: hasInitialAnchor && search.event_instance_id == null,
  });
  const [visibleCount, setVisibleCountState] = useState(weekDays.length);
  const userHasNavigatedRef = useRef(hasInitialAnchor);
  const visibleDays = useMemo(() => weekDays.slice(0, visibleCount), [weekDays, visibleCount]);

  const setVisibleCount = useCallback((count: number) => {
    setVisibleCountState(count);
  }, []);

  useLayoutEffect(() => {
    if (userHasNavigatedRef.current) return;
    syncWeekStartForVisibleCount(visibleCount);
  }, [visibleCount, syncWeekStartForVisibleCount]);

  const deepLink = useClassroomScheduleDeepLink();
  const lastNavigatedAnchorTokenRef = useRef(0);

  // Навигация в провайдере (владелец weekStart): до модалки и независимо от Calendar
  useLayoutEffect(() => {
    const token = deepLink.pendingAnchorToken;
    if (token === 0 || token === lastNavigatedAnchorTokenRef.current) return;

    const anchor = resolveDeepLinkAnchorDate(
      deepLink.pendingAnchorDate,
      deepLink.pendingEventToOpen,
    );
    if (anchor == null) return;

    lastNavigatedAnchorTokenRef.current = token;
    userHasNavigatedRef.current = true;
    goToDay(anchor);
    deepLink.acknowledgeAnchorNavigation();
  }, [
    deepLink.pendingAnchorDate,
    deepLink.pendingEventToOpen,
    deepLink.pendingAnchorToken,
    goToDay,
    deepLink.acknowledgeAnchorNavigation,
  ]);

  const goToPrevWithNav = useCallback(
    (count: number) => {
      userHasNavigatedRef.current = true;
      goToPrev(count);
    },
    [goToPrev],
  );

  const goToNextWithNav = useCallback(
    (count: number) => {
      userHasNavigatedRef.current = true;
      goToNext(count);
    },
    [goToNext],
  );

  const goToWeekStartWithNav = useCallback(
    (date: Date) => {
      userHasNavigatedRef.current = true;
      goToWeekStart(date);
    },
    [goToWeekStart],
  );

  const goToVisibleWindowForDateWithNav = useCallback(
    (date: Date, visibleCount: number) => {
      userHasNavigatedRef.current = true;
      goToVisibleWindowForDate(date, visibleCount);
    },
    [goToVisibleWindowForDate],
  );

  const value = useMemo(
    () => ({
      weekDays,
      weekStart,
      visibleDays,
      visibleDayCount: visibleCount,
      setVisibleCount,
      goToPrev: goToPrevWithNav,
      goToNext: goToNextWithNav,
      goToWeekStart: goToWeekStartWithNav,
      goToVisibleWindowForDate: goToVisibleWindowForDateWithNav,
      goToDay,
      onAddLessonClick,
      pendingEventToOpen: deepLink.pendingEventToOpen,
      pendingAnchorDate: deepLink.pendingAnchorDate,
      pendingAnchorToken: deepLink.pendingAnchorToken,
      acknowledgePendingLessonOpen: deepLink.acknowledgePendingLessonOpen,
      acknowledgeAnchorNavigation: deepLink.acknowledgeAnchorNavigation,
      mobileScheduleAnchorTs: deepLink.mobileScheduleAnchorTs,
    }),
    [
      weekDays,
      weekStart,
      visibleDays,
      visibleCount,
      goToPrevWithNav,
      goToNextWithNav,
      goToWeekStartWithNav,
      goToVisibleWindowForDateWithNav,
      goToDay,
      onAddLessonClick,
      deepLink.pendingEventToOpen,
      deepLink.pendingAnchorDate,
      deepLink.pendingAnchorToken,
      deepLink.acknowledgePendingLessonOpen,
      deepLink.acknowledgeAnchorNavigation,
      deepLink.mobileScheduleAnchorTs,
    ],
  );

  return (
    <ClassroomScheduleContext.Provider value={value}>{children}</ClassroomScheduleContext.Provider>
  );
};
