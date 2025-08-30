import { useCallback, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@xipkg/select';
import { Button } from '@xipkg/button';
import { ChevronBottom, ChevronUp } from '@xipkg/icons';
import { isCalendarMode, isWeekOrDayMode, ModeVariant, type CalendarMode } from './types';
import { MonthCalendar, Sidebar, YearCalendar, WeekCalendar } from './components';
import { useCalendar } from '../hooks';
import { useTranslation } from 'react-i18next';

const MODE_VARIANTS: ModeVariant[] = [
  {
    label: 'День',
    value: 'day',
  },
  {
    label: 'Неделя',
    value: 'week',
  },
  {
    label: 'Месяц',
    value: 'month',
  },
  {
    label: 'Год',
    value: 'year',
  },
];

export const CalendarModule = () => {
  const [mode, setMode] = useState<CalendarMode>('month');
  const { days, currentDate } = useCalendar();
  const { t } = useTranslation('calendar');

  const MONTHS = t('months').split(',');

  const handleChangeMode = useCallback((newMode: string) => {
    if (isCalendarMode(newMode)) {
      setMode(newMode);
    } else {
      console.error('Unexpected mode value');
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] items-start">
      <div className="grow px-[16px] md:pr-0 md:pl-[16px]">
        <div className="flex items-center justify-between pt-1 pb-4">
          <p>
            <span className="text-xl-base font-bold dark:text-gray-100">
              {MONTHS[currentDate.getMonth()]}{' '}
            </span>
            <span className="text-xl-base text-gray-60">{currentDate.getFullYear()}</span>
          </p>
          <div className="flex items-center gap-4 [&>span]:text-gray-100">
            <Select value={mode} onValueChange={(value) => handleChangeMode(value)}>
              <SelectTrigger size="s" className="w-32 dark:text-gray-100">
                <SelectValue
                  placeholder={t('change_view')}
                  className="text-gray-100 [&>span]:text-gray-100"
                />
              </SelectTrigger>
              <SelectContent className="text-gray-100 [&>span]:text-gray-100">
                <SelectGroup className="text-gray-100 [&>span]:text-gray-100">
                  {MODE_VARIANTS.map((variant) => (
                    <SelectItem
                      value={variant.value}
                      key={variant.value}
                      className="dark:text-gray-100"
                    >
                      {variant.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant="secondary"
              size="s"
              className="xs:block hidden rounded-md border px-4 py-1 text-sm font-medium dark:text-gray-100"
            >
              {t('today')}
            </Button>

            <div>
              <Button variant="ghost" size="s" className="px-2">
                <ChevronUp className="h-4 w-4 dark:fill-gray-100" />
              </Button>
              <Button variant="ghost" size="s" className="px-2">
                <ChevronBottom className="h-4 w-4 dark:fill-gray-100" />
              </Button>
            </div>
          </div>
        </div>
        {mode === 'month' && <MonthCalendar days={days[mode]} />}
        {mode === 'year' && <YearCalendar days={days[mode]} />}
        {isWeekOrDayMode(mode) && <WeekCalendar days={days[mode]} view={mode} />}
      </div>

      {mode !== 'year' && <Sidebar />}
    </div>
  );
};
