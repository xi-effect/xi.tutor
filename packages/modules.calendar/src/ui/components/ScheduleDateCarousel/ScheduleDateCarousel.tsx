import { Button } from '@xipkg/button';
import { ArrowLeft, ArrowRight } from '@xipkg/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { cn } from '@xipkg/utils';

import 'swiper/css';

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const SCROLL_STEP = 3;
/** Во вьюпорте всегда ровно одна неделя — 7 дней */
const DAYS_VISIBLE = 7;
const DAY_PILL_MIN_WIDTH = 36;
const DAY_GAP_PX = 8;
const SLIDE_TO_SPEED_MS = 320;

const styles = {
  dayPillBase:
    'flex h-[48px] w-[36px] min-w-[36px] shrink-0 flex-col items-center justify-center rounded-lg text-center',
  dayPillDefaultHover: 'hover:bg-gray-10 hover:text-gray-80',
} as const;

/** ~±2 года — практически без «края» ленты; при необходимости можно поднять */
const DATE_RANGE_PAST = 730;
const DATE_RANGE_FUTURE = 730;

const getDatesRange = (fromDays: number, toDays: number) => {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = -fromDays; i <= toDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

type ScheduleDateCarouselProps = {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  className?: string;
};

export const ScheduleDateCarousel = ({
  className = '',
  selectedDate,
  onSelectedDateChange,
}: ScheduleDateCarouselProps) => {
  const swiperRef = useRef<SwiperType | null>(null);

  const dates = useMemo(() => getDatesRange(DATE_RANGE_PAST, DATE_RANGE_FUTURE), []);
  const selectedIndex = useMemo(
    () => dates.findIndex((d) => d.getTime() === selectedDate.getTime()),
    [dates, selectedDate],
  );
  const effectiveIndex = selectedIndex >= 0 ? selectedIndex : 0;

  /** Индекс первого видимого дня при центрировании выбранной даты в окне из 7 дней */
  const alignedStartIndex = useMemo(
    () =>
      Math.max(
        0,
        Math.min(effectiveIndex - Math.floor(DAYS_VISIBLE / 2), dates.length - DAYS_VISIBLE),
      ),
    [dates.length, effectiveIndex],
  );

  const maxStartIndex = Math.max(0, dates.length - DAYS_VISIBLE);

  /** Позиция ленты: стрелки двигают только её; к выбранной дате подстраивается при смене даты */
  const [carouselStartIndex, setCarouselStartIndex] = useState(alignedStartIndex);

  useEffect(() => {
    setCarouselStartIndex(alignedStartIndex);
  }, [selectedDate, alignedStartIndex]);

  const handleSwiper = useCallback(
    (swiper: SwiperType) => {
      swiperRef.current = swiper;
      swiper.slideTo(carouselStartIndex, 0);
    },
    [carouselStartIndex],
  );

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (swiper.activeIndex === carouselStartIndex) return;
    swiper.slideTo(carouselStartIndex, SLIDE_TO_SPEED_MS);
  }, [carouselStartIndex]);

  const goPrev = useCallback(() => {
    setCarouselStartIndex((prev) => Math.max(0, prev - SCROLL_STEP));
  }, []);

  const goNext = useCallback(() => {
    setCarouselStartIndex((prev) => Math.min(maxStartIndex, prev + SCROLL_STEP));
  }, [maxStartIndex]);

  const handleSelectDate = useCallback(
    (date: Date) => {
      const idx = dates.findIndex((d) => d.getTime() === date.getTime());
      if (idx >= 0) onSelectedDateChange(dates[idx]);
    },
    [dates, onSelectedDateChange],
  );

  const todayStartMs = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);

  return (
    <div className={cn('flex w-full flex-row items-center justify-center gap-2', className)}>
      <Button
        variant="none"
        className="text-gray-80 hover:bg-gray-10 flex h-[48px] w-[36px] min-w-[36px] items-center justify-center rounded-lg p-0"
        onClick={goPrev}
        disabled={carouselStartIndex === 0}
      >
        <ArrowLeft className="fill-brand-80 h-5 w-5" />
      </Button>

      <div className="min-h-[48px] min-w-0 flex-1 overflow-hidden">
        <Swiper
          className="w-full"
          slidesPerView={DAYS_VISIBLE}
          spaceBetween={DAY_GAP_PX}
          allowTouchMove={false}
          simulateTouch={false}
          resistanceRatio={0.85}
          onSwiper={handleSwiper}
          initialSlide={carouselStartIndex}
        >
          {dates.map((date) => {
            const isSelected = date.getTime() === selectedDate.getTime();
            const isToday = date.getTime() === todayStartMs;
            const dayName = DAY_NAMES[date.getDay()];
            const dayNum = date.getDate();
            return (
              <SwiperSlide
                key={date.getTime()}
                className="!box-border !flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={cn(
                    styles.dayPillBase,
                    !isSelected && styles.dayPillDefaultHover,
                    !isSelected && isToday && 'bg-brand-20/50',
                  )}
                  style={{
                    minWidth: DAY_PILL_MIN_WIDTH,
                    backgroundColor: isSelected
                      ? 'var(--xi-brand-80)'
                      : isToday
                        ? undefined
                        : 'transparent',
                    color: isSelected ? 'var(--xi-gray-0)' : 'var(--xi-gray-60)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      lineHeight: '14px',
                      color: isSelected ? 'var(--xi-gray-0)' : 'var(--xi-gray-50)',
                    }}
                  >
                    {dayName}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: 500,
                      color: isSelected ? 'var(--xi-gray-0)' : 'var(--xi-gray-70)',
                    }}
                  >
                    {dayNum}
                  </span>
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <Button
        variant="none"
        className="text-gray-80 hover:bg-gray-10 flex h-[48px] w-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg p-0"
        onClick={goNext}
        disabled={carouselStartIndex >= maxStartIndex}
      >
        <ArrowRight className="fill-brand-80 h-5 w-5" />
      </Button>
    </div>
  );
};
