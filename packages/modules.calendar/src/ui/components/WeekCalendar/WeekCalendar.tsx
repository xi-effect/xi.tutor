import { FC } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';

import { useEvents } from '../../../hooks';
import { CalendarEvent } from '../CalendarEvent/CalendarEvent';
import { ScrollArea } from '@xipkg/scrollarea';

import type { CalendarProps, WeekOrDayMode } from '../../types';

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

interface WeekCalendarProps extends CalendarProps<WeekOrDayMode> {
  view: WeekOrDayMode; // "week" | "day"
}

/**
 * Адаптивный компонент календаря «Неделя / День».
 * ─ Первый столбец (метки времени) фиксирован шириной 5 rem.
 * ─ На week-view 8 колонок: time-col + 7 дней. На day-view: time-col + 1 день.
 * ─ sticky-хедер с названиями дней и дат, основная сетка прокручивается по вертикали.
 */
export const WeekCalendar: FC<WeekCalendarProps> = ({ days, view }) => {
  const { getDayEvents } = useEvents();
  const { t } = useTranslation('calendar');

  const WEEK_DAYS = t('week_days').split(',');

  // Шаблон колонок для CSS grid
  const colTemplate =
    view === 'day'
      ? '[grid-template-columns:theme(width.20)_1fr]'
      : '[grid-template-columns:theme(width.20)_repeat(7,minmax(0,1fr))]';

  return (
    <div className="h-[calc(100vh-112px)] w-full overflow-hidden">
      {/* Хедер */}
      <div
        className={cn(
          'border-gray-10 sticky top-0 z-10 grid border-b bg-white text-xs',
          colTemplate,
        )}
      >
        {/* Пустая ячейка-заглушка под колонку времени */}
        <div className="flex h-10 w-20 items-center justify-end pr-2" />
        {days.map((day, index) => (
          <div key={day.toISOString()} className="flex h-10 items-center justify-center p-2">
            {`${view === 'day' ? '' : WEEK_DAYS[index]} ${format(day, 'd')}`}
          </div>
        ))}
      </div>

      {/* Основная прокручиваемая зона */}
      <ScrollArea className="h-full">
        <div className={cn('grid', colTemplate)}>
          {/* Колонка времени */}
          <div className="flex flex-col text-right text-xs">
            {/* Весь день */}
            <div className="border-gray-10 h-10 w-20 border-b py-3 pr-2">Весь день</div>
            {hours.map((hour, i) => (
              <div key={hour} className="h-20 w-20 pr-2">
                <span className="relative -top-1.5 block">{i !== 0 && hour}</span>
              </div>
            ))}
          </div>

          {/* Колонки дней */}
          {days.map((day) => (
            <div key={day.toISOString()} className="border-gray-10 border-l">
              {/* Секция "Весь день" */}
              <div className="border-gray-10 h-10 border-b p-1">
                {getDayEvents(day)
                  .filter((e) => !e.start)
                  .map((event) => (
                    <CalendarEvent key={event.id} calendarEvent={event} />
                  ))}
              </div>

              {/* Слоты часов */}
              {hours.map((hour, i) => (
                <div key={hour} className="border-gray-10 h-20 border-b p-1">
                  {getDayEvents(day)
                    .filter((e) => e.start?.getHours() === i)
                    .map((event) => (
                      <CalendarEvent key={event.id} calendarEvent={event} />
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
