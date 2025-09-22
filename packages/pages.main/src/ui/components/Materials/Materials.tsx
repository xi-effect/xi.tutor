import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { useNavigate } from '@tanstack/react-router';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { MaterialsAdd } from 'features.materials.add';

const materialsMock = [
  {
    id: 1,
    name: 'Past simple — 1',
    updated_at: '9 февраля',
  },
  {
    id: 2,
    name: 'Past simple — 2',
    updated_at: '9 февраля',
  },
  {
    id: 3,
    name: 'Past simple — 3',
    updated_at: '9 февраля',
  },
];

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
          <TooltipTrigger asChild>
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

        <MaterialsAdd />
      </div>
      <div className="flex flex-row">
        {materialsMock && materialsMock.length > 0 && (
          <ScrollArea
            className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {materialsMock.map((_, index) => (
                <div
                  key={index}
                  className="border-gray-60 flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4"
                >
                  <h3 className="text-l-base font-medium text-gray-100">Past simple — 1</h3>
                  <div className="flex flex-row items-center justify-start gap-2">
                    <span className="text-s-base text-gray-80 font-medium">
                      Изменено: 9 февраля
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        {materialsMock && materialsMock.length === 0 && (
          <div className="flex flex-row gap-8">
            <p className="text-m-base text-gray-60">Здесь пока пусто</p>
          </div>
        )}
      </div>
    </div>
  );
};
