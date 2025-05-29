import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';

export const Overview = () => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Занятия</h2>
          <Button
            variant="ghost"
            className="flex size-8 items-center justify-center rounded-[4px] p-0"
          >
            <ArrowRight className="fill-gray-60 size-6" />
          </Button>
        </div>
        <div className="flex flex-row">
          <ScrollArea
            className="h-[186px] w-[calc(100vw-104px)] overflow-x-auto overflow-y-hidden"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {[...new Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="border-gray-60 flex min-h-[172px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4"
                >
                  <Badge variant="success" size="s">
                    Оплачено
                  </Badge>
                  <h3 className="text-l-base font-medium text-gray-100">Past simple</h3>
                  <div className="flex flex-row items-center justify-start gap-2">
                    <span className="text-s-base text-gray-80 font-medium">
                      Сегодня, 12:00–12:40
                    </span>
                    <span className="text-xs-base text-gray-60 font-medium">40 минут</span>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-brand-0 text-brand-100 hover:text-brand-80 hover:bg-brand-10 mt-auto h-8 self-end rounded-lg border-none"
                  >
                    Начать занятие
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Материалы</h2>
          <Button
            variant="ghost"
            className="flex size-8 items-center justify-center rounded-[4px] p-0"
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
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Оплаты</h2>
          <Button
            variant="ghost"
            className="flex size-8 items-center justify-center rounded-[4px] p-0"
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
                <div
                  key={index}
                  className="border-gray-60 flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4"
                >
                  <span className="text-s-base text-gray-80 font-medium">11 мая, 12:32</span>
                  <div className="flex flex-row items-baseline gap-0.5">
                    <h3 className="text-h6 font-medium text-gray-100">320</h3>
                    <span className="text-m-base text-gray-60 font-medium">₽</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
