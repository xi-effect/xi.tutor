import { useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import { Clock } from '@xipkg/icons';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import {
  formatTimeParts,
  getTimePickerHours,
  getTimePickerMinutes,
  parseTimeParts,
} from '../../utils';

type TimeInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Для поля окончания — время начала, от него фильтруются слоты */
  minTime?: string;
  className?: string;
};

const optionButtonClass = (selected: boolean) =>
  cn(
    'flex h-7 w-full cursor-pointer items-center justify-center rounded-md text-sm tabular-nums outline-none transition-colors',
    selected
      ? 'bg-action-primary-background-default text-text-on-accent hover:bg-action-primary-background-hover'
      : 'bg-transparent text-text-secondary hover:bg-background-subtle hover:text-text-primary',
  );

const columnClass =
  'max-h-52 min-w-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const TimeInput: FC<TimeInputProps> = ({
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  disabled,
  minTime,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const maskRef = useMaskInput('time');
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const parsed = parseTimeParts(value);
  const hours = useMemo(() => getTimePickerHours(minTime), [minTime]);
  const selectedHour = parsed && hours.includes(parsed.hours) ? parsed.hours : hours[0];
  const minutes = useMemo(
    () => (selectedHour == null ? [] : getTimePickerMinutes(selectedHour, minTime)),
    [selectedHour, minTime],
  );
  const selectedMinute = parsed && minutes.includes(parsed.minutes) ? parsed.minutes : minutes[0];

  useEffect(() => {
    if (!open) return;
    const hourEl = hourListRef.current?.querySelector('[data-selected="true"]');
    const minuteEl = minuteListRef.current?.querySelector('[data-selected="true"]');
    hourEl?.scrollIntoView({ block: 'center' });
    minuteEl?.scrollIntoView({ block: 'center' });
  }, [open, selectedHour, selectedMinute]);

  const commitTime = (hoursValue: number, minutesValue: number, close = false) => {
    onChange(formatTimeParts(hoursValue, minutesValue));
    if (close) setOpen(false);
  };

  const handleHourSelect = (hour: number) => {
    const nextMinutes = getTimePickerMinutes(hour, minTime);
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
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor asChild>
        <div className="w-full">
          <Input
            ref={maskRef}
            name={name}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={() => {
              onBlur?.();
              setOpen(false);
            }}
            onFocus={() => {
              if (!disabled) setOpen(true);
            }}
            onClick={() => {
              if (!disabled) setOpen(true);
            }}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            className={cn('border-border-default rounded-lg border', className)}
            after={<Clock className="fill-icon-brand h-4 w-4" />}
            afterClassName="cursor-pointer"
            afterProps={{
              onMouseDown: (event) => event.preventDefault(),
              onClick: () => {
                if (!disabled) setOpen(true);
              },
            }}
            variant="s"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onMouseDown={(event) => event.preventDefault()}
        className="border-border-default bg-background-surface z-100 min-w-0 overflow-hidden rounded-lg border p-1 shadow-lg"
        style={{ width: 'var(--radix-popper-anchor-width)' }}
      >
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
                  onMouseDown={(event) => event.preventDefault()}
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
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleMinuteSelect(minute)}
                >
                  {String(minute).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
