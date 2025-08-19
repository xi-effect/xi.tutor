import { FC } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { cn } from '@xipkg/utils';
import { ScrollArea } from '@xipkg/scrollarea';

import { useCalendar } from '../../../hooks';
import {
  getWeeksNumbers,
  isCurrentDay,
  isCurrentMonth,
  isWeekend,
  isPastDay,
} from '../../../utils';
import { getDateKey, useEventsByDate } from '../../../store/eventsStore';
import { CalendarEvent } from '../CalendarEvent/CalendarEvent';

import type { CalendarProps } from '../../types';

/**
 * Компонент календаря месяца с узкой колонкой номеров недель.
 * ─ На ≥ md первый столбец фиксирован (theme(width.7) ≈ 1.75rem), остальные 7 столбцов гибкие 1fr.
 * ─ На мобиле по-прежнему 7 столбцов без номеров недель.
 */
export const MonthCalendar: FC<CalendarProps<'month'>> = ({ days }) => {
  const { currentDate } = useCalendar();
  const { t } = useTranslation('calendar');

  const WEEK_DAYS = t('week_days').split(',');
  const weekNumbers = getWeeksNumbers(days);
  const groupedEvents = useEventsByDate();

  return (
    <div className="h-[calc(100vh-112px)] w-full overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div className="min-w-max">
          {/* Хедер дней недели */}
          <div className="bg-gray-0 sticky top-0 z-10 grid grid-cols-7 md:[grid-template-columns:theme(width.7)_repeat(7,minmax(0,1fr))]">
            {/* Пустая ячейка / метка недели */}
            <div className="hidden h-10 w-7 items-center justify-center font-medium md:flex">Н</div>
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="text-gray-80 text-m-base flex h-10 items-center justify-center text-center font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Сетка дней */}
          <div className="grid auto-rows-fr grid-cols-7 md:[grid-template-columns:theme(width.7)_repeat(7,minmax(0,1fr))]">
            {days.map((day, idx) => {
              const isRowStart = idx % 7 === 0;
              const weekIdx = Math.floor(idx / 7);
              const cells: React.ReactNode[] = [];
              const dayKey = getDateKey(day);

              if (isRowStart) {
                cells.push(
                  <div
                    key={`week-${weekNumbers[weekIdx]}`}
                    className="border-gray-10 hidden h-32 items-start justify-center border-t border-r pt-1 text-xs md:flex md:h-44"
                  >
                    {weekNumbers[weekIdx]}
                  </div>,
                );
              }

              cells.push(
                <div
                  key={day.toISOString()}
                  className="border-gray-10 relative h-32 border-t border-r p-1 sm:h-40 md:h-44"
                >
                  <span
                    className={cn(
                      'absolute top-1 right-1 flex min-h-8 min-w-8 items-center justify-center rounded-sm px-1 text-sm',
                      !isCurrentMonth(day, currentDate.getMonth()) && 'text-gray-30',
                      isWeekend(day) && 'text-red-80',
                      isWeekend(day) &&
                        !isCurrentMonth(day, currentDate.getMonth()) &&
                        'text-red-60',
                      isCurrentDay(day, currentDate) && 'bg-brand-80 text-brand-0',
                    )}
                  >
                    {day.getDate() === 1
                      ? `${format(day, 'LLLL')} ${format(day, 'd')}`
                      : format(day, 'd')}
                  </span>

                  <div className="mt-6 flex h-[calc(100%-1.5rem)] flex-col space-y-0.5 overflow-hidden">
                    {groupedEvents[dayKey]?.map((event) => (
                      <CalendarEvent
                        key={event.id}
                        event={event}
                        isPast={isPastDay(day, currentDate)}
                      />
                    ))}
                  </div>
                </div>,
              );

              return cells;
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
