import { ScrollArea } from '@xipkg/scrollarea';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { boardsMock, notesMock } from '../../mocks';
import { useGetClassroom } from 'common.services';

import { Card } from './Card';

export const Materials = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  if (isLoading) {
    return (
      <div className="flex flex-col">
        {/* Учебные доски секция */}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-row">
            <div className="h-[96px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]">
              <div className="flex flex-row gap-8">
                {[...new Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex justify-between rounded-2xl border p-4"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="flex h-full flex-col justify-between">
                        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                      <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Заметки секция */}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-row">
            <div className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]">
              <div className="flex flex-row gap-8">
                {[...new Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex justify-between rounded-2xl border p-4"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="flex h-full flex-col justify-between gap-4">
                        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
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
        <p className="text-gray-600">Не удалось загрузить материалы кабинета</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Учебные доски</h2>
        </div>
        <div className="flex flex-row">
          <ScrollArea
            className="max-h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8 pb-4">
              {boardsMock.map((board) => (
                <Card
                  key={board.id}
                  value={board}
                  onClick={() => {
                    // Сохраняем только параметр call при переходе
                    const filteredSearch = search.call ? { call: search.call } : {};

                    navigate({
                      to: `/board/${board.id}`,
                      search: (prev: Record<string, unknown>) => ({
                        ...prev,
                        ...filteredSearch,
                      }),
                    });
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Заметки</h2>
        </div>
        <div className="flex flex-row">
          <ScrollArea
            className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {notesMock.map((note) => (
                <Card
                  key={note.id}
                  value={note}
                  onClick={() => {
                    // Сохраняем только параметр call при переходе
                    const filteredSearch = search.call ? { call: search.call } : {};

                    navigate({
                      to: `/editor/${note.id}`,
                      search: (prev: Record<string, unknown>) => ({
                        ...prev,
                        ...filteredSearch,
                      }),
                    });
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
