import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { addWeeks, startOfWeek } from 'date-fns';
import { cn } from '@xipkg/utils';
import { getWeekDays } from '../../../utils';

import 'swiper/css';

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const WEEK_SLIDES_COUNT = 5; // прошлая, текущая, следующая + буфер для плавности
const INITIAL_SLIDE_INDEX = 2; // текущая неделя по центру

const styles = {
  dayPillBase:
    'flex h-10 min-w-[36px] flex-1 flex-col items-center justify-center rounded-xl text-center transition-colors',
} as const;

type ScheduleWeekCarouselProps = {
  weekStart: Date;
  selectedDate: Date;
  onWeekStartChange: (date: Date) => void;
  onSelectedDateChange: (date: Date) => void;
};

export const ScheduleWeekCarousel = ({
  weekStart,
  selectedDate,
  onWeekStartChange,
  onSelectedDateChange,
}: ScheduleWeekCarouselProps) => {
  const weeks = useMemo(() => {
    const base = addWeeks(weekStart, -INITIAL_SLIDE_INDEX);
    return Array.from({ length: WEEK_SLIDES_COUNT }, (_, i) =>
      startOfWeek(addWeeks(base, i), { weekStartsOn: 1 }),
    );
  }, [weekStart]);

  const currentWeekIndex = useMemo(() => {
    const ws = weekStart.getTime();
    return Math.max(
      0,
      weeks.findIndex((w) => w.getTime() === ws),
    );
  }, [weeks, weekStart]);

  const swiperRef = useRef<SwiperType | null>(null);

  const handleSwiper = useCallback(
    (swiper: SwiperType) => {
      swiperRef.current = swiper;
      swiper.slideTo(currentWeekIndex, 0);
    },
    [currentWeekIndex],
  );

  useEffect(() => {
    swiperRef.current?.slideTo(currentWeekIndex, 0);
  }, [currentWeekIndex]);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newWeekStart = weeks[swiper.activeIndex];
      if (newWeekStart) {
        onWeekStartChange(newWeekStart);
        const newWeekEnd = newWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000;
        const dayInNewWeek =
          selectedDate.getTime() >= newWeekStart.getTime() && selectedDate.getTime() < newWeekEnd
            ? selectedDate
            : newWeekStart;
        onSelectedDateChange(dayInNewWeek);
      }
    },
    [weeks, selectedDate, onWeekStartChange, onSelectedDateChange],
  );

  return (
    <Swiper
      className="h-[84px] w-full"
      slidesPerView={1}
      spaceBetween={0}
      onSwiper={handleSwiper}
      onSlideChange={handleSlideChange}
      initialSlide={currentWeekIndex}
    >
      {weeks.map((start) => {
        const days = getWeekDays(start);
        return (
          <SwiperSlide key={start.toISOString()} className="py-6">
            <div className="grid grid-cols-7 gap-1 px-1">
              {days.map((date, i) => {
                const isSelected = date.getTime() === selectedDate.getTime();
                const dayName = DAY_NAMES[i];
                const dayNum = date.getDate();
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => onSelectedDateChange(date)}
                    className={cn(styles.dayPillBase)}
                    style={{
                      backgroundColor: isSelected ? 'var(--xi-brand-80)' : 'transparent',
                      color: isSelected ? 'var(--xi-gray-0)' : 'var(--xi-gray-60)',
                    }}
                  >
                    <span
                      className="text-xxs-base-size leading-[14px]"
                      style={{
                        color: isSelected ? 'var(--xi-gray-0)' : 'var(--xi-gray-50)',
                      }}
                    >
                      {dayName}
                    </span>
                    <span
                      className="text-[14px] leading-5 font-medium"
                      style={{
                        color: isSelected ? 'var(--xi-gray-0)' : 'var(--xi-gray-70)',
                      }}
                    >
                      {dayNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};
