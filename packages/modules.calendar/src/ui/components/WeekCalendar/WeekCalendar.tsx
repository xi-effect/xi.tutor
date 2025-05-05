import { format } from "date-fns";
import { cn } from "@xipkg/utils";

import { useEvents } from "../../../hooks";
import { CalendarEvent } from "../CalendarEvent/CalendarEvent";

import type { FC } from "react";
import { CalendarProps, WEEK_DAYS, type WeekOrDayMode } from "../../config";


const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

interface WeekCalendarProps extends CalendarProps<WeekOrDayMode> {
  view: WeekOrDayMode
};

export const WeekCalendar: FC<WeekCalendarProps> = ({ days, view }) => {
  const { getDayEvents } = useEvents();

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
            return (
              <div key={day.toISOString()} className="flex flex-col border-l border-gray-10">
                <div className="h-10 p-1 border-y border-gray-10">
                  {getDayEvents(day)
                  .filter((event) => !event.start)
                  .map((event) => <CalendarEvent calendarEvent={event} key={event.id} />)
                  }
                </div>
                {hours.map((hour, index) => (
                  <div key={hour} className="h-20 p-1 border-b border-gray-10">
                    {getDayEvents(day)
                    .filter((event) => event.start?.getHours() === index)
                    .map((event) => <CalendarEvent calendarEvent={event} key={event.id} />)
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
