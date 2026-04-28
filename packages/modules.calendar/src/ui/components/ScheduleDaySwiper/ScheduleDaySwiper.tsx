import { useCallback, useEffect, useRef } from 'react';
import { isSameDay, startOfDay } from 'date-fns';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Virtual } from 'swiper/modules';
import { LessonCard } from '../ScheduleKanban/LessonCard';
import { LessonCardSkeleton } from '../ScheduleKanban/LessonCardSkeleton';
import { ScheduleEmptyState } from '../ScheduleKanban/ScheduleEmptyState';
import { getDateKey, useEventsByDate, useEventsLoading } from '../../../store/eventsStore';
import { useLessonInfoModal } from '../../../hooks';
import { getLessonCardSkeletonCountForDay, isCurrentDay, isPastDay } from '../../../utils';
import type { ChangeLessonFormData } from 'features.lesson.change';
import type { ICalendarEvent, LessonCancelScope } from '../../types';

import 'swiper/css';
import 'swiper/css/virtual';

const getEventsForDay = (
  eventsByDate: Record<string, ICalendarEvent[]>,
  day: Date,
): ICalendarEvent[] => {
  const key = getDateKey(day);
  const events = eventsByDate[key] ?? [];
  return events.filter((e) => !e.isAllDay);
};

type ScheduleDaySwiperProps = {
  /** Подряд идущие дни (несколько недель) — см. `getWeeksRangeDays` */
  days: Date[];
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  onAddLessonClick?: (date: Date) => void;
  onLessonReschedule?: (event: ICalendarEvent) => void;
  onLessonCancel?: (event: ICalendarEvent, scope: LessonCancelScope) => void;
  onSaveLesson?: (event: ICalendarEvent, data: ChangeLessonFormData) => void;
  hideLessonCardClassroomAndSubject?: boolean;
};

export const ScheduleDaySwiper = ({
  days,
  selectedDate,
  onSelectedDateChange,
  onAddLessonClick,
  onLessonReschedule,
  onLessonCancel,
  onSaveLesson,
  hideLessonCardClassroomAndSubject = false,
}: ScheduleDaySwiperProps) => {
  const eventsByDate = useEventsByDate();
  const eventsLoading = useEventsLoading();
  const today = new Date();
  const todayStart = startOfDay(today);
  const swiperRef = useRef<SwiperType | null>(null);
  const { openLessonInfo, lessonInfoModal } = useLessonInfoModal({
    onReschedule: onLessonReschedule,
    onCancelLesson: onLessonCancel,
    onSaveLesson,
  });

  const selectedIndex = days.findIndex((d) => isSameDay(d, selectedDate));
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const handleSwiper = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
  }, []);

  useEffect(() => {
    if (swiperRef.current && activeIndex !== swiperRef.current.activeIndex) {
      swiperRef.current.slideTo(activeIndex, 300);
    }
  }, [activeIndex]);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newDate = days[swiper.activeIndex];
      if (newDate) {
        onSelectedDateChange(newDate);
      }
    },
    [days, onSelectedDateChange],
  );

  return (
    <>
      <Swiper
        modules={[Virtual]}
        className="min-h-0 w-full flex-1 [&_.swiper-wrapper]:min-h-[calc(100dvh-292px)]"
        autoHeight
        touchEventsTarget="container"
        touchStartPreventDefault={false}
        slidesPerView={1}
        spaceBetween={8}
        virtual={{
          enabled: true,
          addSlidesBefore: 1,
          addSlidesAfter: 1,
        }}
        onSwiper={handleSwiper}
        onSlideChange={handleSlideChange}
        initialSlide={activeIndex}
        resistanceRatio={0.85}
      >
        {days.map((day, dayIndex) => {
          const events = getEventsForDay(eventsByDate, day);
          const isPast = isPastDay(day, today);
          return (
            <SwiperSlide
              key={day.toISOString()}
              virtualIndex={dayIndex}
              className="box-border h-full min-h-0"
            >
              <div className="flex h-full min-h-0 flex-col pb-4">
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                  {eventsLoading ? (
                    Array.from({ length: getLessonCardSkeletonCountForDay(day) }, (_, i) => (
                      <LessonCardSkeleton
                        key={i}
                        isToday={isCurrentDay(day, todayStart)}
                        fullWidth
                      />
                    ))
                  ) : events.length === 0 ? (
                    <ScheduleEmptyState
                      days={[day]}
                      onScheduleClick={() => onAddLessonClick?.(day)}
                      fillColumn
                      className="min-h-0"
                    />
                  ) : (
                    events.map((event) => (
                      <LessonCard
                        key={event.id}
                        event={event}
                        isPast={isPast}
                        isToday={isCurrentDay(day, todayStart)}
                        fullWidth
                        hideClassroomAndSubject={hideLessonCardClassroomAndSubject}
                        onClick={() => openLessonInfo(event)}
                      />
                    ))
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      {lessonInfoModal}
    </>
  );
};
