import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { formatToShortDate } from 'pages.materials';
import { boardsMock, notesMock } from '../../mocks';
import { useGetClassroom } from 'common.services';

export const Materials = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 p-4">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
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
            className="h-[96px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {boardsMock.map((board) => (
                <div
                  key={board.id}
                  onClick={() => {
                    navigate({ to: `/board/${board.id}` });
                  }}
                  className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex cursor-pointer justify-between rounded-2xl border p-4"
                >
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex h-full flex-col justify-between">
                      <div className="text-l-base line-clamp-2 w-full font-medium text-gray-100">
                        <p className="truncate">{board.name}</p>
                      </div>
                      <div className="text-s-base text-gray-60 font-normal">
                        Обновлено: {formatToShortDate(board.updated_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-6 w-6" variant="ghost" size="icon">
                          <MoreVert className="h-4 w-4 dark:fill-gray-100" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="bottom"
                        align="end"
                        className="border-gray-10 bg-gray-0 border p-1"
                      >
                        <DropdownMenuItem>Удалить</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
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
                <div
                  key={note.id}
                  onClick={() => {
                    navigate({ to: `/editor/${note.id}` });
                  }}
                  className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex cursor-pointer justify-between rounded-2xl border p-4"
                >
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div className="text-l-base line-clamp-2 w-full font-medium text-gray-100">
                        <p className="truncate">{note.name}</p>
                      </div>
                      <div className="text-s-base text-gray-60 font-normal">
                        Обновлено: {formatToShortDate(note.updated_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-6 w-6" variant="ghost" size="icon">
                          <MoreVert className="h-4 w-4 dark:fill-gray-100" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="bottom"
                        align="end"
                        className="border-gray-10 bg-gray-0 border p-1"
                      >
                        <DropdownMenuItem>Копировать</DropdownMenuItem>
                        <DropdownMenuItem>Удалить</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
