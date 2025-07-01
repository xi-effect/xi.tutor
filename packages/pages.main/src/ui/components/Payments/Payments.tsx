import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Payment } from './Payment';
import { useNavigate } from '@tanstack/react-router';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

export const Payments = () => {
  const navigate = useNavigate();

  const handleMore = () => {
    navigate({
      to: '/payments',
    });
  };
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Оплаты</h2>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 items-center justify-center rounded-[4px] p-0"
              onClick={handleMore}
            >
              <ArrowRight className="fill-gray-60 size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>К оплатам</TooltipContent>
        </Tooltip>
        <div className="ml-auto flex flex-row items-center gap-2 max-sm:hidden">
          <Button
            size="s"
            className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
          >
            Создать счет на оплату
          </Button>
        </div>
      </div>
      <div className="flex flex-row">
        <ScrollArea
          className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
          scrollBarProps={{ orientation: 'horizontal' }}
        >
          <div className="flex flex-row gap-8">
            {[...new Array(10)].map((_, index) => (
              <Payment key={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
