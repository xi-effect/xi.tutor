import { format } from 'date-fns';
import { cn } from '@xipkg/utils';

import { ScrollArea } from '@xipkg/scrollarea';
import { getFullDateString } from '../utils/utils';

// Функция для создания даты с сегодняшним днем и фиксированным временем
const createTodayWithTime = (timeString: string) => {
  const today = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  today.setHours(hours, minutes, 0, 0);
  return today;
};

// Тип для события календаря
interface CalendarEventType {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  isAllDay: boolean;
  isCancelled?: boolean;
}

// Простой компонент события для моковых данных
const CalendarEvent = ({ event }: { event: CalendarEventType }) => (
  <div className="group hover:bg-gray-5 text-gray-80 flex cursor-pointer gap-1 rounded-sm">
    <div
      className={cn(
        'xs:block hidden w-1 min-w-1 rounded-[2px]',
        event.type === 'rest' && 'bg-green-80',
        event.type === 'lesson' && 'bg-brand-80',
        event.isCancelled && 'bg-red-80',
      )}
    />
    <div
      className={cn(
        event.type === 'lesson' && 'group-hover:text-brand-80',
        event.type === 'rest' && 'group-hover:text-green-80',
        event.isCancelled && 'group-hover:text-red-80',
      )}
    >
      <p className="font-medium">{event.title}</p>
      <p className="mr-1 text-xs">
        {!event.isAllDay && format(event.start, 'HH:mm') + ' - время начала'}
      </p>
    </div>
  </div>
);

const MOCK_EVENTS: CalendarEventType[] = [
  {
    id: '1',
    title: 'Дмитрий',
    start: createTodayWithTime('17:00'),
    end: createTodayWithTime('18:00'),
    type: 'lesson',
    isAllDay: false,
  },
  {
    id: '2',
    title: 'Отдых',
    start: new Date(),
    end: new Date(),
    type: 'rest',
    isAllDay: true,
  },
  {
    id: '3',
    title: 'Анна',
    start: createTodayWithTime('17:00'),
    end: createTodayWithTime('18:00'),
    type: 'lesson',
    isCancelled: true,
    isAllDay: false,
  },
  {
    id: '5',
    title: 'Елена',
    start: createTodayWithTime('10:00'),
    end: createTodayWithTime('12:00'),
    type: 'lesson',
    isAllDay: false,
  },
];

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

/**
 * Адаптивный компонент календаря «День».
 * ─ Первый столбец (метки времени) фиксирован шириной 5 rem.
 * ─ На day-view: time-col + 1 день.
 * ─ sticky-хедер с названием дня и датой, основная сетка прокручивается по вертикали.
 */
export const DayCalendar = ({ day }: { day: Date }) => {
  // Шаблон колонок для CSS grid
  const colTemplate = '[grid-template-columns:theme(width.20)_1fr]';

  return (
    <div className="h-[calc(100vh-112px)] w-full overflow-hidden">
      {/* Хедер */}
      <h5 className="text-gray-80 text-m-base text-center font-medium">
        {getFullDateString(day, 'long')}
      </h5>

      {/* Основная прокручиваемая зона */}
      <ScrollArea className="h-full">
        <div className={cn('grid', colTemplate)}>
          {/* Колонка времени */}
          <div className="flex flex-col text-right text-xs">
            {/* Весь день */}
            <div className="border-gray-10 h-10 w-20 border-b py-3 pr-2 dark:text-gray-100">
              Весь день
            </div>
            {hours.map((hour, i) => (
              <div key={hour} className="h-20 w-20 pr-2">
                <span className="relative -top-1.5 block dark:text-gray-100">
                  {i !== 0 && hour}
                </span>
              </div>
            ))}
          </div>

          <div className="border-gray-10 border-l">
            {/* Секция "Весь день" */}
            <div className="border-gray-10 h-10 border-b p-1">
              {MOCK_EVENTS.map(
                (event) => event.isAllDay && <CalendarEvent key={event.id} event={event} />,
              )}
            </div>

            {/* Слоты часов */}
            {hours.map((hour) => (
              <div key={hour} className="border-gray-10 h-20 border-b p-1">
                {MOCK_EVENTS.map((event) => {
                  const hourAsNumber = +hour.split(':')[0];

                  return (
                    !event.isAllDay &&
                    event.start.getHours() === hourAsNumber && (
                      <CalendarEvent key={event.id} event={event} />
                    )
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
