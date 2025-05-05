import { format } from "date-fns";
import { cn } from "@xipkg/utils";

import { MONTHS, WEEK_DAYS } from "../../config";
import { isCurrentMonth, isWeekend } from "../../../utils";

import type { FC } from "react";
import type { CalendarProps } from "../../config";


export const YearCalendar: FC<CalendarProps<'year'>> = ({ days }) => {

  return (
    <div className="grid grid-cols-4 gap-6">
      {days.map((month, monthIndex) => (
        <div key={MONTHS[monthIndex]} className="p-4">
          <div className="font-semibold text-sm mb-2">{MONTHS[monthIndex]}</div>
          <div className="grid grid-cols-7 text-xs text-muted-foreground text-center mb-1">
            {WEEK_DAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {month.map((day) => {
              const isOutOfMonth = !isCurrentMonth(day, monthIndex);
              const weekend = isWeekend(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "w-6 h-6 text-center text-xs rounded-full mx-auto flex items-center justify-center",
                    isOutOfMonth && "text-gray-30",
                    weekend && "text-red-80",
                    weekend && isOutOfMonth && "text-red-60"
                  )}
                >
                  {`${format(day, "d")}`}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};