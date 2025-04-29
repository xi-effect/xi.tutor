import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { cn } from "@xipkg/utils";

import type { FC } from "react";
import { WEEK_DAYS, type CalendarEvent, type WeekOrDayMode } from "../../config";


const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

interface WeekCalendarProps {
  events: CalendarEvent[];
  date: Date;
  view?: WeekOrDayMode
};


export const WeekCalendar: FC<WeekCalendarProps> = ({ events, date, view = "week" }) => {
  const days = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date, { weekStartsOn: 1 }), i))
    : [date];

  return (
    <div>
        <div className={cn(
          "grid grid-cols-[repeat(7,_1fr)] w-full pl-[80px]",
          view === "day" && "grid-cols-[1fr]"
        )}>
          {days.map((day, index) => (
            <div key={day.toISOString()} className="p-2 text-xs text-center">
              {`${WEEK_DAYS[index]} ${format(day, "d")}`}
            </div>
          ))}
        </div>

        <div className={cn(
          "grid grid-cols-[80px_repeat(7,_1fr)] w-full",
          view === "day" && "grid-cols-[80px_1fr]"
        )}>
          <div className="flex flex-col text-xs text-right pr-2">
            <div className="w-20 h-10 py-3 pr-2 border-y border-gray-10">Весь день</div>
            {hours.map((hour, index) => (
              <div key={hour} className="w-20 h-20 pr-2">
                <span className="block relative top-[-6px]">{index !== 0 && hour}</span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayEvents = events.filter((event) => {
              return isSameDay(new Date(event.start || event.end), day);
            });

            return (
              <div key={day.toISOString()} className="flex flex-col border-l border-gray-10">
                <div className="h-10 p-1 border-y border-gray-10">
                  {dayEvents
                  .filter((event) => !event.start)
                  .map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                      "text-sm px-1 py-0.5 rounded border-l-4",
                      event.type === "vacation" && "border-green-80",
                      event.type === "task" && "border-brand-80",
                      event.type === "cancelled" && "border-red-80"
                      )}
                    >
                      <span className="font-medium">{event.title}</span>
                    </div>
                  ))
                  }
                </div>
                {hours.map((hour, index) => (
                  <div key={hour} className="h-20 p-1 border-b border-gray-10">
                    {dayEvents
                    .filter((event) => event.start?.getHours() === index)
                    .map((event) => {
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "text-sm px-1 py-0.5 rounded border-l-4",
                              event.type === "vacation" && "border-green-80",
                              event.type === "task" && "border-brand-80",
                              event.type === "cancelled" && "border-red-80"
                            )}
                          >
                            <span className="font-medium">{event.title}</span>
                          </div>
                        );
                      })
                    }
                  </div>
                ))}
              </div>
            );
          })}
        </div>
    </div>
  );
};
