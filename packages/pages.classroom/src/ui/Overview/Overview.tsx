/* eslint-disable @typescript-eslint/ban-ts-comment */
// import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';

import { CardMaterials, materialsMock, type CardMaterialsProps } from '../CardMaterials';

export const Overview = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    navigate({
      // @ts-ignore
      search: { tab },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        {/* Занятия секция */}
        {/* <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-row">
            <div className="h-[186px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]">
              <div className="flex flex-row gap-8">
                {[...new Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex min-h-[172px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="mt-auto h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}

        {/* Материалы секция */}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-row">
            <div className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]">
              <div className="flex flex-row gap-8">
                {[...new Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Оплаты секция */}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-row">
            <div className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]">
              <div className="flex flex-row gap-8">
                {[...new Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    <div className="flex flex-row items-baseline gap-0.5">
                      <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить информацию о кабинете</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Занятия</h2>
          <Button
            variant="ghost"
            className="flex size-8 items-center justify-center rounded-[4px] p-0"
            onClick={() => handleTabChange('lessons')}
          >
            <ArrowRight className="fill-gray-60 size-6" />
          </Button>
        </div>
        <div className="flex flex-row">
          <ScrollArea
            className="h-[186px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
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
      </div> */}
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Материалы</h2>
          <Button
            variant="ghost"
            className="flex size-8 items-center justify-center rounded-[4px] p-0"
            onClick={() => handleTabChange('materials')}
          >
            <ArrowRight className="fill-gray-60 size-6" />
          </Button>
        </div>
        <div className="flex flex-row">
          <ScrollArea
            className="min-h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8 pb-4">
              {materialsMock.map((material) => (
                <CardMaterials
                  key={material.id}
                  accessTypes={material as CardMaterialsProps['accessTypes']}
                />
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
            onClick={() => handleTabChange('payments')}
          >
            <ArrowRight className="fill-gray-60 size-6" />
          </Button>
        </div>
        <div className="flex flex-row">
          <ScrollArea
            className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {[...new Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="border-gray-30 bg-gray-0 flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-4 rounded-2xl border p-4"
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
