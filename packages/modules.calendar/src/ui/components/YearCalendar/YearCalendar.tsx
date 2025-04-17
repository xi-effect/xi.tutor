import { format } from "date-fns";
import { MONTHS, WEEK_DAYS } from "../../config";

import type { FC } from "react";
import useYearlyCalendar from "../../../hooks/useYearlyCalendar";
import { cn } from "@xipkg/utils";


type YearCalendarProps = {
  year: number;
};


export const YearCalendar: FC<YearCalendarProps> = ({ year }) => {
  const { yearCalendar, isCurrentMonth, isWeekend } = useYearlyCalendar(year);

  console.log('yearCalendar', yearCalendar);
  
  
  return (
    <div className="grid grid-cols-4 gap-6">
      {yearCalendar.map((month, monthIndex) => (
        <div key={MONTHS[monthIndex]} className="p-4">
          <div className="font-semibold text-sm mb-2">{MONTHS[monthIndex]}</div>
          <div className="grid grid-cols-7 text-xs text-muted-foreground text-center mb-1">
            {WEEK_DAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {month.days.map((day) => {
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

// function MonthGrid({
//   year,
//   month,
// }: {
//   year: number;
//   month: number;
// }) {
//   const daysInMonth = getDaysInMonth(new Date(year, month));
//   const startDay = (getDay(new Date(year, month, 1)) + 6) % 7;

//   const cells = Array.from({ length: startDay + daysInMonth }, (_, i) => {
//     const day = i >= startDay ? i - startDay + 1 : null;

//     return (
//       <div
//         key={i}
//         className="w-6 h-6 text-center text-xs rounded-full mx-auto flex items-center justify-center"
//       >
//         {day || ""}
//       </div>
//     );
//   });

//   return (
//     <div className="grid grid-cols-7 gap-1 text-xs">
//       {cells}
//     </div>
//   );
// }