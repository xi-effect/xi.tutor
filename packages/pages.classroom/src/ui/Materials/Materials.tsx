import { ScrollArea } from '@xipkg/scrollarea';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroom,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';

import { CardMaterials } from '../CardMaterials/CardMaterials';

export const Materials = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getList = isTutor ? useGetClassroomMaterialsList : useGetClassroomMaterialsListStudent;

  // Получаем материалы кабинета
  const {
    data: boardsData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
  } = getList({
    classroomId: classroomId || '',
    content_type: 'board',
    disabled: !classroomId,
  });

  const {
    data: notesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
  } = getList({
    classroomId: classroomId || '',
    content_type: 'note',
    disabled: !classroomId,
  });

  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  if (isLoading || isBoardsLoading || isNotesLoading) {
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

  if (isError || isBoardsError || isNotesError || !classroom) {
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
            className="max-h-[150px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8 pb-4">
              {boardsData?.length ? (
                boardsData.map((board) => (
                  <CardMaterials
                    key={board.id}
                    material={board}
                    showIcon={false}
                    onClick={() => {
                      // Сохраняем только параметр call при переходе
                      const filteredSearch = search.call ? { call: search.call } : {};

                      navigate({
                        to: `/board/${board.id}`,
                        search: () => ({
                          ...filteredSearch,
                          classroom: classroomId,
                        }),
                      });
                    }}
                  />
                ))
              ) : (
                <div className="flex h-[150px] w-full items-center justify-center">
                  <p className="text-gray-50">Нет учебных досок</p>
                </div>
              )}
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
            className="h-[150px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {notesData?.length ? (
                notesData.map((note) => (
                  <CardMaterials
                    key={note.id}
                    material={note}
                    showIcon={false}
                    onClick={() => {
                      // Сохраняем только параметр call при переходе
                      const filteredSearch = search.call ? { call: search.call } : {};

                      navigate({
                        to: `/note/${note.id}`,
                        search: () => ({
                          ...filteredSearch,
                          classroom: classroomId,
                        }),
                      });
                    }}
                  />
                ))
              ) : (
                <div className="flex h-[150px] w-full items-center justify-center">
                  <p className="text-gray-50">Нет заметок</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
