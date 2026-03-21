import { Button } from '@xipkg/button';
import { ArrowLeft, ArrowRight } from '@xipkg/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@xipkg/utils';

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const SCROLL_STEP = 3;
const DAY_PILL_MIN_WIDTH = 36;

const styles = {
  dayPillBase:
    'flex h-[48px] w-[36px] min-w-[36px] shrink-0 flex-col items-center justify-center rounded-lg text-center',
  dayPillDefaultHover: 'hover:bg-gray-10 hover:text-gray-80',
} as const;

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
    () =>
      Math.max(
        0,
        Math.min(effectiveIndex - Math.floor(visibleCount / 2), dates.length - visibleCount),
      ),
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
    <div
      ref={containerRef}
      className={cn('flex w-full flex-row items-center justify-center gap-2', className)}
    >
      <Button
        variant="none"
        className="text-gray-80 hover:bg-gray-10 flex h-[48px] w-[36px] min-w-[36px] items-center justify-center rounded-lg p-0"
        onClick={goPrev}
        disabled={effectiveIndex === 0}
      >
        <ArrowLeft className="fill-brand-80 h-5 w-5" />
      </Button>
      <div className="flex min-w-0 flex-row items-center justify-center gap-2">
        {visibleDates.map((date, slotIndex) => {
          const isSelected = date.getTime() === selectedDate.getTime();
          const dayName = DAY_NAMES[date.getDay()];
          const dayNum = date.getDate();
          return (
            <button
              key={slotIndex}
              type="button"
              onClick={() => handleSelectDate(date)}
              className={cn(styles.dayPillBase, !isSelected && styles.dayPillDefaultHover)}
              style={{
                minWidth: DAY_PILL_MIN_WIDTH,
                backgroundColor: isSelected ? 'var(--xi-brand-80)' : 'transparent',
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
          );
        })}
      </div>
      <Button
        variant="none"
        className="text-gray-80 hover:bg-gray-10 flex h-[48px] w-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg p-0"
        onClick={goNext}
        disabled={effectiveIndex >= dates.length - 1}
      >
        <ArrowRight className="fill-brand-80 h-5 w-5" />
      </Button>
    </div>
  );
};
