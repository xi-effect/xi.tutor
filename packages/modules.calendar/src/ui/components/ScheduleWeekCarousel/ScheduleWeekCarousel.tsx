import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { isSameDay } from 'date-fns';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { cn } from '@xipkg/utils';
import { getWeekDays, getWeekStartsRange } from '../../../utils';

import 'swiper/css';

/** ±5 лет — практически без «края» ленты недель */
const WEEKS_PAST = 260;
const WEEKS_FUTURE = 260;
const SLIDE_TO_SPEED_MS = 280;

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
  const { t, i18n } = useTranslation('calendar');
  const dayNames = useMemo(() => t('week_days').split(','), [t, i18n.language]);
  const weeks = useMemo(() => getWeekStartsRange(WEEKS_PAST, WEEKS_FUTURE), []);

  const currentWeekIndex = useMemo(() => {
    const weekStartMs = weekStart.getTime();
    const exactIndex = weeks.findIndex((week) => week.getTime() === weekStartMs);
    if (exactIndex >= 0) return exactIndex;

    return weeks.reduce((closestIndex, week, index) => {
      const closestWeek = weeks[closestIndex];
      const closestDistance = Math.abs(closestWeek.getTime() - weekStartMs);
      const nextDistance = Math.abs(week.getTime() - weekStartMs);
      return nextDistance < closestDistance ? index : closestIndex;
    }, 0);
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
    const swiper = swiperRef.current;
    if (!swiper || swiper.activeIndex === currentWeekIndex) return;
    swiper.slideTo(currentWeekIndex, SLIDE_TO_SPEED_MS);
  }, [currentWeekIndex]);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newWeekStart = weeks[swiper.activeIndex];
      if (!newWeekStart) return;

      onWeekStartChange(newWeekStart);

      const newWeekEnd = newWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000;
      const dayInNewWeek =
        selectedDate.getTime() >= newWeekStart.getTime() && selectedDate.getTime() < newWeekEnd
          ? selectedDate
          : newWeekStart;

      onSelectedDateChange(dayInNewWeek);
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
      resistanceRatio={0.85}
    >
      {weeks.map((start) => {
        const days = getWeekDays(start);
        return (
          <SwiperSlide key={start.toISOString()} className="py-6">
            <div className="grid grid-cols-7 gap-1 px-1">
              {days.map((date, i) => {
                const isSelected = isSameDay(date, selectedDate);
                const dayName = dayNames[i];
                const dayNum = date.getDate();
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => onSelectedDateChange(date)}
                    data-umami-event="schedule-date-select"
                    data-umami-event-source="mobile-week"
                    className={cn(styles.dayPillBase)}
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--xi-action-primary-background-default)'
                        : 'transparent',
                      color: isSelected ? 'var(--xi-text-on-accent)' : 'var(--xi-text-secondary)',
                    }}
                  >
                    <span
                      className="text-xxs-base-size leading-[14px]"
                      style={{
                        color: isSelected ? 'var(--xi-text-on-accent)' : 'var(--xi-text-muted)',
                      }}
                    >
                      {dayName}
                    </span>
                    <span
                      className="text-[14px] leading-5 font-medium"
                      style={{
                        color: isSelected ? 'var(--xi-text-on-accent)' : 'var(--xi-text-secondary)',
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
