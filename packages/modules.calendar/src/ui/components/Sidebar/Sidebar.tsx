import { Button } from "@xipkg/button";
import { Calendar } from "@xipkg/calendar";

export const Sidebar = () => {
  return (
    <div 
      className="hidden md:flex w-[320px] h-full self-start flex-col justify-between px-2 py-1 border-l border-gray-10"
    >
      <div>
        <Button className="w-full mb-4">Создать событие</Button>
        <p className="text-center">Или выделите время в календаре</p>
      </div>
      <Calendar classNames={{
        months: 'sm:flex-col',
        month_caption: 'hidden',
        table: 'w-full border-collapse',
        head_row: 'grid grid-cols-7',
        row: 'grid grid-cols-7',
        cell: 'text-center p-2',
        day: 'rounded hover:bg-gray-200'
      }} />
    </div>
  );
};




