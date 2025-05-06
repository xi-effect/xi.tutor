import { cn } from "@xipkg/utils";

import { timeToString } from "../../../utils";

import type { FC } from "react";
import type { ICalendarEvent } from "../../types";

interface CalendarEventProps {
  calendarEvent: ICalendarEvent
}

export const CalendarEvent:FC<CalendarEventProps> = ({ calendarEvent }) => {

  return (
    <div
      key={calendarEvent.id}
      className={cn(
        "text-sm px-1 py-0.5 rounded border-l-4",
        calendarEvent.type === "vacation" && "border-green-80",
        calendarEvent.type === "task" && "border-brand-80",
        calendarEvent.type === "cancelled" && "border-red-80"
      )}
    >
      {calendarEvent.start && 
        <span className="mr-1 text-xs">
          {timeToString(calendarEvent.start)}
        </span>
      }
      <span className="font-medium">{calendarEvent.title}</span>
    </div>
  );
};