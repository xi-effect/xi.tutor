import { ScrollArea } from '@xipkg/scrollarea';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import {
  useGetClassroom,
  useGetClassroomMaterialsList,
  useDeleteClassroomMaterials,
} from 'common.services';

import { Card } from './Card';

export const Materials = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  // Получаем материалы кабинета
  const {
    data: boardsData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
  } = useGetClassroomMaterialsList({
    classroomId: classroomId || '',
    content_type: 'board',
    disabled: !classroomId,
  });

  const {
    data: notesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
  } = useGetClassroomMaterialsList({
    classroomId: classroomId || '',
    content_type: 'note',
    disabled: !classroomId,
  });

  // Хук для удаления материалов
  const { deleteClassroomMaterials } = useDeleteClassroomMaterials();

  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  // Обработчик удаления доски
  const handleDeleteBoard = (boardId: string, boardName: string) => {
    if (classroomId) {
      deleteClassroomMaterials.mutate({
        classroomId,
        id: boardId,
        content_kind: 'board',
        name: boardName,
      });
    }
  };

  // Обработчик удаления заметки
  const handleDeleteNote = (noteId: string, noteName: string) => {
    if (classroomId) {
      deleteClassroomMaterials.mutate({
        classroomId,
        id: noteId,
        content_kind: 'note',
        name: noteName,
      });
    }
  };

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
            className="max-h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8 pb-4">
              {boardsData?.data?.length ? (
                boardsData.data.map((board) => (
                  <Card
                    key={board.id}
                    value={{
                      id: Number(board.id),
                      name: board.name,
                      updated_at: board.createdAt,
                      created_at: board.createdAt,
                      kind: board.content_kind,
                      last_opened_at: board.createdAt,
                    }}
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
                    onDelete={() => handleDeleteBoard(board.id, board.name)}
                  />
                ))
              ) : (
                <div className="flex h-[96px] w-full items-center justify-center">
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
            className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {notesData?.data?.length ? (
                notesData.data.map((note) => (
                  <Card
                    key={note.id}
                    value={{
                      id: Number(note.id),
                      name: note.name,
                      updated_at: note.createdAt,
                      created_at: note.createdAt,
                      kind: note.content_kind,
                      last_opened_at: note.createdAt,
                    }}
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
                    onDelete={() => handleDeleteNote(note.id, note.name)}
                  />
                ))
              ) : (
                <div className="flex h-[96px] w-full items-center justify-center">
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
