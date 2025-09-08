import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

export const Sidebar = () => {
  return (
    <div className="mt-8 w-full shrink-0 flex-col justify-between gap-4 self-start px-4 lg:mt-[52px] lg:flex lg:h-[calc(100vh-128px)] lg:w-[320px] 2xl:w-[430px]">
      <div className="lg:border-gray-30 flex h-full flex-col justify-start gap-4 rounded-2xl p-0 md:p-4 lg:border">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Расписание на сегодня</h2>
          <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 items-center justify-center rounded-[4px] p-0"
                onClick={() => console.log(1)}
              >
                <ArrowRight className="fill-gray-60 size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>К расписанию</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-2">
          {[...new Array(3)].map((_, index) => (
            <div
              key={index}
              className="hover:bg-brand-0 border-brand-80 flex flex-col rounded-l-sm rounded-tr-lg rounded-br-lg border-l-4 pl-2 transition-colors"
            >
              <h6 className="text-base font-medium">Имя ученика</h6>
              <p className="text-s-base">Описание (создается автоматом)</p>
              <span className="text-xs-base">17:40</span>
            </div>
          ))}
        </div>
        <div className="text-s-base mt-auto">
          <Button variant="secondary" size="s" className="w-full rounded-lg">
            Открыть расписание
          </Button>
        </div>
      </div>
    </div>
  );
};
