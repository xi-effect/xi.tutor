import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Cabinet } from './Cabinet';

export const Cabinets = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Кабинеты</h2>
        <Button
          variant="ghost"
          className="flex size-8 items-center justify-center rounded-[4px] p-0"
          onClick={() => {}}
        >
          <ArrowRight className="fill-gray-60 size-6" />
        </Button>
      </div>
      <div className="flex flex-row">
        <ScrollArea
          className="h-[110px] w-[calc(100vw-104px)] overflow-x-auto overflow-y-hidden"
          scrollBarProps={{ orientation: 'horizontal' }}
        >
          <div className="flex flex-row gap-8">
            {[...new Array(10)].map((_, index) => (
              <Cabinet key={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
