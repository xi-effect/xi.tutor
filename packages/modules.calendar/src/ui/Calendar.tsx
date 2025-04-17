
// import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';

// import { cn } from '@xipkg/utils';
import { useState } from 'react';
import { Button } from '@xipkg/button';
import { MOCK_EVENTS, MONTHS, type CalendarMode } from './config';
import { MonthCalendar } from './components/MonthCalendar/MonthCalendar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { YearCalendar } from './components/YearCalendar/YearCalendar';


export const CalendarModule = () => {

  const [ mode, setMode ] = useState<CalendarMode>('month');
  const today = new Date(Date.now());
  const month = MONTHS[today.getMonth()];
  
  return (
    <div className='flex items-center'>
      <div className='pl-2 grow'>
        <div className='flex items-center justify-between pb-2'>
          <p>
            <span className='font-bold'>{month} </span>
            <span>{today.getFullYear()}</span>
          </p>
          <Button onClick={() => setMode('year')}>Сменить представление</Button>

        </div>
        {mode === 'month' && <MonthCalendar date={today} events={MOCK_EVENTS} />}
        {mode === 'year' && <YearCalendar year={today.getFullYear()} />}
      </div>
      {mode !== 'year' && <Sidebar />}
    </div>

  );
};

