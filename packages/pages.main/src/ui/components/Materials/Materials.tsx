import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { useNavigate } from '@tanstack/react-router';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

export const Materials = () => {
  const navigate = useNavigate();

  const handleMore = () => {
    navigate({
      to: '/materials',
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Материалы</h2>
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
          <TooltipContent>К материалам</TooltipContent>
        </Tooltip>
        <div className="ml-auto flex flex-row items-center gap-2 max-sm:hidden">
          <Button
            variant="secondary"
            size="s"
            className="text-s-base border-gray-60 rounded-lg border px-4 py-2 font-medium text-gray-100 max-[550px]:hidden"
          >
            Загрузить файл
          </Button>
          <Button
            variant="secondary"
            size="s"
            className="text-s-base border-gray-60 rounded-lg border px-4 py-2 font-medium text-gray-100 max-[550px]:hidden"
          >
            Создать заметку
          </Button>
          <Button
            size="s"
            className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
          >
            Создать доску
          </Button>
        </div>
      </div>
      <div className="flex flex-row">
        <ScrollArea
          className="h-[110px] w-[calc(100vw-104px)] overflow-x-auto overflow-y-hidden"
          scrollBarProps={{ orientation: 'horizontal' }}
        >
          <div className="flex flex-row gap-8">
            {[...new Array(10)].map((_, index) => (
              <div
                key={index}
                className="border-gray-60 flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4"
              >
                <h3 className="text-l-base font-medium text-gray-100">Past simple — 1</h3>
                <div className="flex flex-row items-center justify-start gap-2">
                  <span className="text-s-base text-gray-80 font-medium">Изменено: 9 февраля</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
