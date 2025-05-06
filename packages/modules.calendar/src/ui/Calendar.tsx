
import { useCallback, useState } from 'react';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectGroup, 
  SelectItem 
} from '@xipkg/select';
import { Button } from '@xipkg/button';
import { ChevronBottom, ChevronUp } from '@xipkg/icons';
import { isCalendarMode, isWeekOrDayMode, ModeVariant, type CalendarMode } from './types';
import { MonthCalendar } from './components/MonthCalendar/MonthCalendar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { YearCalendar } from './components/YearCalendar/YearCalendar';
import { WeekCalendar } from './components/WeekCalendar/WeekCalendar';
import { useCalendar } from '../hooks/useCalendar';
import { useTranslation } from 'react-i18next';


const MODE_VARIANTS: ModeVariant[] = [
  {
    label: 'День',
    value: 'day'
  },
  {
    label: 'Неделя',
    value: 'week'
  },
  {
    label: 'Месяц',
    value: 'month'
  },
  {
    label: 'Год',
    value: 'year'
  }
];


export const CalendarModule = () => {
  const [ mode, setMode ] = useState<CalendarMode>('month');
  const { days, currentDate } = useCalendar();
  const { t } = useTranslation('calendar');

  const MONTHS = t('months').split(',');

  const handleChangeMode = useCallback((newMode: string) => {
    if(isCalendarMode(newMode)) {
      setMode(newMode);
    } else {
      console.error('Unexpected mode value');
    }
  }, []);
  
  return (
    <div className='flex items-center'>
      <div className='px-[16px] md:pl-[16px] md:pr-0 grow'>
        <div className='flex items-center justify-between pb-4'>
          <p>
            <span className='font-bold'>{MONTHS[currentDate.getMonth()]} </span>
            <span>{currentDate.getFullYear()}</span>
          </p>
          <div className='flex items-center gap-4'>
            <Select value={mode} onValueChange={(value) => handleChangeMode(value)}>
              <SelectTrigger size='s' className='w-32'>
                <SelectValue placeholder={t('change_view')} />
              </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MODE_VARIANTS.map((variant) => (
                  <SelectItem value={variant.value} key={variant.value}>
                    {variant.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
            </Select>

            <div 
              className='hidden xs:block px-4 py-1 border border-gray-30 rounded-md text-sm font-medium'
            >
              {t('today')}
            </div>

            <div>
              <Button variant="ghost" size="s" className='px-2'>
                <ChevronUp className='h-4 w-4' />
              </Button>
              <Button variant="ghost" size="s" className='px-2'>
                <ChevronBottom className='h-4 w-4' />
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

