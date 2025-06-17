import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Lesson } from './Lesson';
import { useNavigate } from '@tanstack/react-router';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

export const Lessons = () => {
  const navigate = useNavigate();

  const handleMore = () => {
    navigate({
      to: '/calendar',
    });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Ближайшие занятия</h2>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger>
            <Button
              variant="ghost"
              className="flex size-8 items-center justify-center rounded-[4px] p-0"
              onClick={handleMore}
            >
              <ArrowRight className="fill-gray-60 size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>К календарю</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-row">
        <ScrollArea
          className="h-[196px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
          scrollBarProps={{ orientation: 'horizontal' }}
        >
          <div className="flex flex-row gap-8">
            {[...new Array(10)].map((_, index) => (
              <Lesson key={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
