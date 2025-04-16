
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek,getWeek } from 'date-fns';

import { CalendarHead } from './components/CalendarHead/CalendarHead';
import { CalendarCell } from './components/CalendarCell/CalendarCell';

import type { FC } from 'react';
import type { CalendarProps } from '../../config';


export const MonthCalendar: FC<CalendarProps> = ({ date, events }) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((event) => isSameDay(day, new Date(event.date)));

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <CalendarHead />
      <div className="text-sm">
        {weeks.map((week) => {
          const weekNumber = getWeek(week[0], { weekStartsOn: 1 });
          return (
            <div key={weekNumber} className="flex items-center">
              <div className="h-44 text-xs text-center py-2.5 w-7 border-t border-b border-gray-10">
                {weekNumber}
              </div>
              <div className="grow grid grid-cols-7">
              {week.map((day) => {
                const dayEvents = getEventsForDay(day);

                return (
                  <CalendarCell calendarEvents={dayEvents} day={day} currentDate={date}/>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


