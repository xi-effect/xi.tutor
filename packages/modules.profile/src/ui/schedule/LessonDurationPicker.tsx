import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@xipkg/utils';
import {
  MAX_TYPICAL_LESSON_DURATION_MINUTES,
  MIN_TYPICAL_LESSON_DURATION_MINUTES,
} from 'common.ui';

const MINUTE_STEPS = [0, 15, 30, 45] as const;
const MAX_HOURS = Math.floor(MAX_TYPICAL_LESSON_DURATION_MINUTES / 60);

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${String(mins).padStart(2, '0')}`;
};

const minutesForHour = (hour: number): number[] =>
  MINUTE_STEPS.filter((minutes) => {
    const total = hour * 60 + minutes;
    return (
      total >= MIN_TYPICAL_LESSON_DURATION_MINUTES && total <= MAX_TYPICAL_LESSON_DURATION_MINUTES
    );
  });

const optionButtonClass = (selected: boolean) =>
  cn(
    'flex h-7 w-full cursor-pointer items-center justify-center rounded-md text-sm tabular-nums outline-none transition-colors',
    selected
      ? 'bg-action-primary-background-default text-text-on-accent hover:bg-action-primary-background-hover'
      : 'bg-transparent text-text-secondary hover:bg-background-subtle hover:text-text-primary',
  );

const columnClass =
  'max-h-52 min-w-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

type LessonDurationPickerProps = {
  valueMinutes: number;
  onChange: (minutes: number) => void;
  'data-umami-event'?: string;
};

export const LessonDurationPicker = ({
  valueMinutes,
  onChange,
  'data-umami-event': umamiEvent,
}: LessonDurationPickerProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const hours = useMemo(
    () =>
      Array.from({ length: MAX_HOURS + 1 }, (_, hour) => hour).filter(
        (hour) => minutesForHour(hour).length > 0,
      ),
    [],
  );
  const selectedHour = Math.floor(valueMinutes / 60);
  const minutes = useMemo(() => minutesForHour(selectedHour), [selectedHour]);
  const selectedMinute = valueMinutes % 60;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    hourListRef.current
      ?.querySelector('[data-selected="true"]')
      ?.scrollIntoView({ block: 'center' });
    minuteListRef.current
      ?.querySelector('[data-selected="true"]')
      ?.scrollIntoView({ block: 'center' });
  }, [open, selectedHour, selectedMinute]);

  const handleHourSelect = (hour: number) => {
    const nextMinutes = minutesForHour(hour);
    const minutesValue = nextMinutes.includes(selectedMinute) ? selectedMinute : nextMinutes[0];
    if (minutesValue == null) return;
    onChange(hour * 60 + minutesValue);
  };

  return (
    <div ref={rootRef} className="relative w-full sm:w-[110px]">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        data-umami-event={umamiEvent}
        className="border-border-default dark:text-text-primary flex h-8 w-full items-center justify-between rounded-lg border px-3 text-sm tabular-nums"
        onClick={() => setOpen((current) => !current)}
      >
        {formatDuration(valueMinutes)}
      </button>
      {open ? (
        <div className="border-border-default bg-background-surface absolute top-[calc(100%+4px)] right-0 left-0 z-20 overflow-hidden rounded-lg border p-1 shadow-lg">
          <div className="flex">
            <div ref={hourListRef} role="listbox" aria-label="Часы" className={columnClass}>
              {hours.map((hour) => {
                const isSelected = selectedHour === hour;
                return (
                  <button
                    key={hour}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-selected={isSelected}
                    className={optionButtonClass(isSelected)}
                    onClick={() => handleHourSelect(hour)}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
            <div className="bg-border-default mx-0.5 w-px self-stretch" />
            <div ref={minuteListRef} role="listbox" aria-label="Минуты" className={columnClass}>
              {minutes.map((minute) => {
                const isSelected = selectedMinute === minute;
                return (
                  <button
                    key={minute}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-selected={isSelected}
                    className={optionButtonClass(isSelected)}
                    onClick={() => {
                      onChange(selectedHour * 60 + minute);
                      setOpen(false);
                    }}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
