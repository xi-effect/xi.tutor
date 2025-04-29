
// import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';

// import { cn } from '@xipkg/utils';
import { useState } from 'react';
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
import { MOCK_EVENTS, MODE_VARIANTS, MONTHS, type CalendarMode, type WeekOrDayMode } from './config';
import { MonthCalendar } from './components/MonthCalendar/MonthCalendar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { YearCalendar } from './components/YearCalendar/YearCalendar';
import { WeekCalendar } from './components/WeekCalendar/WeekCalendar';


export const CalendarModule = () => {

  const [ mode, setMode ] = useState<CalendarMode>('month');
  const today = new Date(Date.now());
  const month = MONTHS[today.getMonth()];

  function isWeekOrDayMode(mode: CalendarMode): mode is WeekOrDayMode {
    return ['week', 'day'].includes(mode);
  }

  const handleChangeMode = (value: CalendarMode) => {
    setMode(value);
  };
  
  return (
    <div className='flex items-center'>
      <div className='px-[16px] md:pl-[16px] md:pr-0 grow'>
        <div className='flex items-center justify-between pb-4'>
          <p>
            <span className='font-bold'>{month} </span>
            <span>{today.getFullYear()}</span>
          </p>
          <div className='flex items-center gap-4'>
            <Select value={mode} onValueChange={(value) => handleChangeMode(value as CalendarMode)}>
              <SelectTrigger size='s' className='w-32'>
                <SelectValue placeholder="Сменить представление" />
              </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MODE_VARIANTS.map((variant) => (
                  <SelectItem value={variant.value}>{variant.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
            </Select>

            <div 
              className='hidden xs:block px-4 py-1 border border-gray-30 rounded-md text-sm font-medium'
            >
              Сегодня
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
        {mode === 'month' && <MonthCalendar date={today} events={MOCK_EVENTS} />}
        {mode === 'year' && <YearCalendar year={today.getFullYear()} />}
        {isWeekOrDayMode(mode) && <WeekCalendar events={MOCK_EVENTS} date={today} view={mode} />}
      </div>
      {mode !== 'year' && <Sidebar />}
    </div>

  );
};

