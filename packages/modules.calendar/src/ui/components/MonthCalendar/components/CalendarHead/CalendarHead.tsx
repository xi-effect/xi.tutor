import { WEEK_DAYS } from "../../../../config";

export const CalendarHead = () => {
  return (
    <div className="flex items-center mb-2 text-sm">
      <div className="hidden md:block w-7">Н</div>

      <div className="grow grid grid-cols-7 text-center font-medium">
          {WEEK_DAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
      </div>
    </div>
  );
};