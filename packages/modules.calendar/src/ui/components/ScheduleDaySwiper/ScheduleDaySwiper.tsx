import { useCallback, useEffect, useRef } from 'react';
import { isSameDay, startOfDay } from 'date-fns';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { LessonCard } from '../ScheduleKanban/LessonCard';
import { ScheduleEmptyState } from '../ScheduleKanban/ScheduleEmptyState';
import { getDateKey, useEventsByDate } from '../../../store/eventsStore';
import { useLessonInfoModal } from '../../../hooks';
import { isCurrentDay, isPastDay } from '../../../utils';
import type { ICalendarEvent } from '../../types';

import 'swiper/css';

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
};

export const ScheduleDaySwiper = ({
  days,
  selectedDate,
  onSelectedDateChange,
  onAddLessonClick,
}: ScheduleDaySwiperProps) => {
  const eventsByDate = useEventsByDate();
  const today = new Date();
  const todayStart = startOfDay(today);
  const swiperRef = useRef<SwiperType | null>(null);
  const { openLessonInfo, lessonInfoModal } = useLessonInfoModal();

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
        className="w-full"
        slidesPerView={1}
        spaceBetween={0}
        autoHeight
        onSwiper={handleSwiper}
        onSlideChange={handleSlideChange}
        initialSlide={activeIndex}
        resistanceRatio={0.85}
      >
        {days.map((day) => {
          const events = getEventsForDay(eventsByDate, day);
          const isPast = isPastDay(day, today);
          return (
            <SwiperSlide key={day.toISOString()}>
              <div className="flex flex-col pb-4">
                <div className="flex flex-col gap-3">
                  {events.length === 0 ? (
                    <ScheduleEmptyState
                      days={[day]}
                      onScheduleClick={() => onAddLessonClick?.(day)}
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
