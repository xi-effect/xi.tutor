import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@xipkg/utils';

const TIME_MINUTE_STEPS = [0, 15, 30, 45] as const;

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (hours: number, minutes: number): string =>
  `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

const parseTime = (time: string): { hours: number; minutes: number } | null => {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
};

const getMinutes = (hour: number, minExclusive?: string, maxExclusive?: string): number[] =>
  TIME_MINUTE_STEPS.filter((minutes) => {
    const total = hour * 60 + minutes;
    if (minExclusive && total <= timeToMinutes(minExclusive)) return false;
    if (maxExclusive && total >= timeToMinutes(maxExclusive)) return false;
    return true;
  });

const getHours = (minExclusive?: string, maxExclusive?: string): number[] =>
  Array.from({ length: 24 }, (_, hour) => hour).filter(
    (hour) => getMinutes(hour, minExclusive, maxExclusive).length > 0,
  );

const optionButtonClass = (selected: boolean) =>
  cn(
    'flex h-7 w-full cursor-pointer items-center justify-center rounded-md text-sm tabular-nums outline-none transition-colors',
    selected
      ? 'bg-action-primary-background-default text-text-on-accent hover:bg-action-primary-background-hover'
      : 'bg-transparent text-text-secondary hover:bg-background-subtle hover:text-text-primary',
  );

const columnClass =
  'max-h-52 min-w-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

type WorkingHoursTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  minExclusive?: string;
  maxExclusive?: string;
  'data-umami-event'?: string;
};

export const WorkingHoursTimePicker = ({
  value,
  onChange,
  minExclusive,
  maxExclusive,
  'data-umami-event': umamiEvent,
}: WorkingHoursTimePickerProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const parsed = parseTime(value);
  const hours = useMemo(() => getHours(minExclusive, maxExclusive), [minExclusive, maxExclusive]);
  const selectedHour = parsed && hours.includes(parsed.hours) ? parsed.hours : hours[0];
  const minutes = useMemo(
    () => (selectedHour == null ? [] : getMinutes(selectedHour, minExclusive, maxExclusive)),
    [selectedHour, minExclusive, maxExclusive],
  );
  const selectedMinute = parsed && minutes.includes(parsed.minutes) ? parsed.minutes : minutes[0];

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
    const hourEl = hourListRef.current?.querySelector('[data-selected="true"]');
    const minuteEl = minuteListRef.current?.querySelector('[data-selected="true"]');
    hourEl?.scrollIntoView({ block: 'center' });
    minuteEl?.scrollIntoView({ block: 'center' });
  }, [open, selectedHour, selectedMinute]);

  const commitTime = (hoursValue: number, minutesValue: number, close = false) => {
    onChange(formatTime(hoursValue, minutesValue));
    if (close) setOpen(false);
  };

  const handleHourSelect = (hour: number) => {
    const nextMinutes = getMinutes(hour, minExclusive, maxExclusive);
    const minutesValue =
      parsed && nextMinutes.includes(parsed.minutes) ? parsed.minutes : nextMinutes[0];
    if (minutesValue == null) return;
    commitTime(hour, minutesValue);
  };

  const handleMinuteSelect = (minute: number) => {
    const hour = selectedHour ?? hours[0];
    if (hour == null) return;
    commitTime(hour, minute, true);
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
        {value}
      </button>
      {open ? (
        <div className="border-border-default bg-background-surface absolute top-[calc(100%+4px)] right-0 left-0 z-20 overflow-hidden rounded-lg border p-1 shadow-lg">
          <div className="flex">
            <div ref={hourListRef} role="listbox" aria-label="Часы" className={columnClass}>
              {hours.map((hour) => {
                const isSelected = parsed != null && parsed.hours === hour;
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
                const isSelected = parsed != null && parsed.minutes === minute;
                return (
                  <button
                    key={minute}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-selected={isSelected}
                    className={optionButtonClass(isSelected)}
                    onClick={() => handleMinuteSelect(minute)}
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
