import { Button } from '@xipkg/button';
import { ArrowLeft, ArrowRight } from '@xipkg/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@xipkg/utils';

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const SCROLL_STEP = 3;
const DAY_PILL_MIN_WIDTH = 48;

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
};

export const ScheduleDateCarousel = ({
  selectedDate,
  onSelectedDateChange,
}: ScheduleDateCarouselProps) => {
  const [containerWidth, setContainerWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => getDatesRange(14, 30), []);
  const selectedIndex = useMemo(
    () => dates.findIndex((d) => d.getTime() === selectedDate.getTime()),
    [dates, selectedDate],
  );
  const effectiveIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const visibleCount = useMemo(
    () => Math.max(3, Math.min(7, Math.floor(containerWidth / DAY_PILL_MIN_WIDTH))),
    [containerWidth],
  );

  const startIndex = useMemo(
    () => Math.max(0, Math.min(effectiveIndex - visibleCount + 1, dates.length - visibleCount)),
    [dates.length, effectiveIndex, visibleCount],
  );

  const visibleDates = useMemo(
    () => dates.slice(startIndex, startIndex + visibleCount),
    [dates, startIndex, visibleCount],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goPrev = useCallback(() => {
    const nextIndex = Math.max(0, effectiveIndex - SCROLL_STEP);
    onSelectedDateChange(dates[nextIndex]);
  }, [dates, effectiveIndex, onSelectedDateChange]);

  const goNext = useCallback(() => {
    const nextIndex = Math.min(dates.length - 1, effectiveIndex + SCROLL_STEP);
    onSelectedDateChange(dates[nextIndex]);
  }, [dates, effectiveIndex, onSelectedDateChange]);

  const handleSelectDate = useCallback(
    (date: Date) => {
      const idx = dates.findIndex((d) => d.getTime() === date.getTime());
      if (idx >= 0) onSelectedDateChange(dates[idx]);
    },
    [dates, onSelectedDateChange],
  );

  return (
    <div ref={containerRef} className="flex w-full flex-row items-center justify-center gap-2">
      <Button
        variant="none"
        className="text-gray-80 hover:bg-gray-10 flex h-[60px] w-[50px] min-w-[50px] items-center justify-center rounded-lg p-0"
        onClick={goPrev}
        disabled={effectiveIndex === 0}
      >
        <ArrowLeft className="fill-brand-80 h-5 w-5" />
      </Button>
      <div className="flex min-w-0 flex-row items-center justify-center gap-2">
        {visibleDates.map((date) => {
          const isSelected = date.getTime() === selectedDate.getTime();
          const dayName = DAY_NAMES[date.getDay()];
          const dayNum = date.getDate();
          return (
            <button
              key={date.getTime()}
              type="button"
              onClick={() => handleSelectDate(date)}
              className={cn(
                'flex h-[60px] w-[50px] min-w-[50px] shrink-0 flex-col items-center justify-center rounded-lg px-2 py-1.5 text-center transition-colors',
                isSelected
                  ? 'bg-brand-80 text-gray-0'
                  : 'text-gray-60 hover:bg-gray-10 hover:text-gray-80 bg-transparent',
              )}
              style={{ minWidth: DAY_PILL_MIN_WIDTH }}
            >
              <span className={cn('text-[10px]', isSelected ? 'text-gray-0' : 'text-gray-50')}>
                {dayName}
              </span>
              <span
                className={cn(
                  'text-[20px] font-medium',
                  isSelected ? 'text-gray-0' : 'text-gray-70',
                )}
              >
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>
      <Button
        variant="none"
        className="text-gray-80 hover:bg-gray-10 flex h-[60px] w-[50px] min-w-[50px] shrink-0 items-center justify-center rounded-lg p-0"
        onClick={goNext}
        disabled={effectiveIndex >= dates.length - 1}
      >
        <ArrowRight className="fill-brand-80 h-5 w-5" />
      </Button>
    </div>
  );
};
