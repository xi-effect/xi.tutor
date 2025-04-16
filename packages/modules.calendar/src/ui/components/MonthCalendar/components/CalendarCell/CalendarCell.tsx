import { format, isSameDay, getDay, isSameMonth, getDate } from 'date-fns';

import type { FC } from "react";
import type { CalendarEvent } from "../../../../config";
import { cn } from "@xipkg/utils";

interface CalendarCellProps {
  calendarEvents: CalendarEvent[]
  day: Date
  currentDate: Date 
}

export const CalendarCell:FC<CalendarCellProps> = ({
  calendarEvents, 
  day, 
  currentDate
}) => {

  const isWeekend = () => {
    const weekday = getDay(day);
    return weekday === 0 || weekday === 6;
  };

  return (
    <div
      key={day.toISOString()}
      className= "h-44 border border-gray-10 p-1 flex flex-col"
    >

      <span
        className={cn(
          "px-2 py-1.5 text-sm text-right",
          isSameDay(day, currentDate) && "w-fit self-end bg-brand-80 rounded-sm text-brand-0",
          !isSameMonth(day, currentDate) && "text-gray-30",
          isWeekend() && "text-red-80",
          isWeekend() && !isSameMonth(day, currentDate) && "text-red-60"
        )}
      >
        {getDate(day) === 1
          ? `${format(day, "LLLL")} ${format(day, "d")}`
          : format(day, "d")}
      </span>

      <div className="flex-1 overflow-y-auto space-y-0.5">
        {calendarEvents.map((event) => (
          <div
            key={event.id}
            className={cn(
              "text-sm px-1 py-0.5 rounded border-l-4",
              event.type === "vacation" && "border-green-80 text-green-80",
              event.type === "task" && "border-blue-80 text-blue-80",
              event.type === "cancelled" && "border-red-80 text-red-80"
            )}
          >
            {event.time && <span className="mr-1 text-xs">{event.time}</span>}
              <span className="font-medium">{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};