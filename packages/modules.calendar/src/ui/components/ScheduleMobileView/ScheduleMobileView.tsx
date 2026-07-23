import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { startOfDay, startOfWeek } from 'date-fns';
import { formatMonthLabel } from '../../../utils/calendarUtils';
import { ScheduleWeekCarousel } from '../ScheduleWeekCarousel';
import { ScheduleDaySwiper } from '../ScheduleDaySwiper';
import { getWeeksRangeDays } from '../../../utils';
import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import type { ChangeLessonFormData } from 'features.lesson.change';
import type { ICalendarEvent } from '../../types';

const getInitialWeekStart = () => startOfWeek(new Date(), { weekStartsOn: 1 });

/** ±2 года дней для свайпа по дням */
const DAY_SWIPER_WEEKS_BEFORE = 104;
const DAY_SWIPER_WEEKS_AFTER = 104;

type ScheduleMobileViewProps = {
  onAddLessonClick?: (date?: Date) => void;
  onLessonReschedule?: (event: ICalendarEvent) => void;
  onSaveLesson?: (event: ICalendarEvent, data: ChangeLessonFormData) => void;
  hideLessonCardClassroomAndSubject?: boolean;
  /** Синхронизация дня с диплинком (moment `getTime()`) */
  mobileScheduleAnchorTs?: number | null;
  openLessonInstanceId?: string | null;
  onOpenLessonInstanceConsumed?: () => void;
};

/** Мобильный вид расписания в стиле iOS Calendar: карусель недель + свайп по дням */
export const ScheduleMobileView = ({
  onAddLessonClick,
  onLessonReschedule,
  onSaveLesson,
  hideLessonCardClassroomAndSubject = false,
  mobileScheduleAnchorTs,
  openLessonInstanceId,
  onOpenLessonInstanceConsumed,
}: ScheduleMobileViewProps) => {
  const { t } = useTranslation('calendar');
  const [weekStart, setWeekStart] = useState<Date>(getInitialWeekStart);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const lastAnchorTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (mobileScheduleAnchorTs == null || !Number.isFinite(mobileScheduleAnchorTs)) return;
    if (lastAnchorTsRef.current === mobileScheduleAnchorTs) return;
    lastAnchorTsRef.current = mobileScheduleAnchorTs;

    const anchor = new Date(mobileScheduleAnchorTs);
    setWeekStart(startOfWeek(anchor, { weekStartsOn: 1 }));
    setSelectedDate(startOfDay(anchor));
  }, [mobileScheduleAnchorTs]);

  const slideDays = useMemo(
    () => getWeeksRangeDays(weekStart, DAY_SWIPER_WEEKS_BEFORE, DAY_SWIPER_WEEKS_AFTER),
    [weekStart],
  );

  const monthLabel = useMemo(() => formatMonthLabel(selectedDate), [selectedDate]);

  const handleWeekStartChange = useCallback((date: Date) => {
    setWeekStart(date);
  }, []);

  const handleSelectedDateChange = useCallback((date: Date) => {
    const normalizedDate = startOfDay(date);
    setSelectedDate(normalizedDate);
    setWeekStart((prev) => {
      const nextWeekStart = startOfWeek(normalizedDate, { weekStartsOn: 1 });
      return nextWeekStart.getTime() === prev.getTime() ? prev : nextWeekStart;
    });
  }, []);

  const handleAddLesson = useCallback(
    (date: Date) => {
      onAddLessonClick?.(date);
    },
    [onAddLessonClick],
  );

  return (
    <div className={cn('bg-background-page flex h-full min-h-0 flex-col overflow-hidden')}>
      <div className="bg-background-page shrink-0 px-4 pt-4 pb-3">
        <div className="bg-background-surface flex h-[184px] flex-col rounded-[20px] p-4">
          <div className="flex h-[32px] flex-row items-center justify-between gap-2">
            <span className="text-l-base text-text-primary font-medium">Расписание</span>
            <span className="text-s-base text-text-secondary">{monthLabel}</span>
          </div>
          <ScheduleWeekCarousel
            weekStart={weekStart}
            selectedDate={selectedDate}
            onWeekStartChange={handleWeekStartChange}
            onSelectedDateChange={handleSelectedDateChange}
          />
          {onAddLessonClick ? (
            <div>
              <Button
                variant="primary"
                size="s"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => handleAddLesson(selectedDate)}
                data-umami-event="schedule-add-lesson-mobile"
              >
                <Plus className="fill-action-primary-text h-4 w-4 shrink-0" />
                {t('add_lesson')}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden px-4')}>
        <ScheduleDaySwiper
          days={slideDays}
          selectedDate={selectedDate}
          onSelectedDateChange={handleSelectedDateChange}
          onAddLessonClick={onAddLessonClick != null ? handleAddLesson : undefined}
          onLessonReschedule={onLessonReschedule}
          onSaveLesson={onSaveLesson}
          hideLessonCardClassroomAndSubject={hideLessonCardClassroomAndSubject}
          openLessonInstanceId={openLessonInstanceId ?? null}
          onOpenLessonInstanceConsumed={onOpenLessonInstanceConsumed}
        />
      </div>
    </div>
  );
};
