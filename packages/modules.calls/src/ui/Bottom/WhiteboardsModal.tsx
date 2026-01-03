import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
} from '@xipkg/modal';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { ScrollArea } from '@xipkg/scrollarea';
import { Badge } from '@xipkg/badge';
import { Checkbox } from '@xipkg/checkbox';
import { useState } from 'react';
import { Close, Search } from '@xipkg/icons';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCallStore } from '../../store';
import { useModeSync } from '../../hooks';
import {
  useCurrentUser,
  useGetClassroomMaterialsList,
  useAddClassroomMaterials,
} from 'common.services';

// Типы материалов определены в common.types -> ClassroomMaterialsT

type WhiteboardsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const WhiteboardsModal = ({ open, onOpenChange }: WhiteboardsModalProps) => {
  const navigate = useNavigate();
  const { callId } = useParams({ strict: false });
  const updateStore = useCallStore((state) => state.updateStore);
  const { syncModeToOthers } = useModeSync();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [isCollaborativeMode, setIsCollaborativeMode] = useState(true);

  // Хук для создания новой доски
  const { addClassroomMaterials } = useAddClassroomMaterials();

  // Загружаем список досок кабинета (classroomId == callId)
  const {
    data: boards,
    isLoading,
    isError,
  } = useGetClassroomMaterialsList({
    classroomId: callId || '',
    content_type: 'board',
    disabled: !callId || !isTutor,
  });

  const filteredWhiteboards = (boards || [])
    // только доски с доступом совместная работа (read_write)
    .filter((b) => b.content_kind === 'board' && b.student_access_mode === 'read_write')
    // фильтр по поисковой строке
    .filter((b) =>
      searchQuery.trim() ? b.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) : true,
    );

  const handleBoardSelect = (boardId: number) => {
    setSelectedBoardId(boardId);
  };

  const handleCreateNewBoard = async () => {
    if (!callId) return;

    try {
      const result = await addClassroomMaterials.mutateAsync({
        classroomId: callId,
        content_kind: 'board',
        student_access_mode: 'read_write', // Режим совместного редактирования
      });

      if (result?.data?.id) {
        const newBoardId = parseInt(result.data.id);

        // Выбираем новую доску
        setSelectedBoardId(newBoardId);

        // Если включен режим совместной работы, отправляем сообщение всем участникам
        if (isCollaborativeMode) {
          syncModeToOthers('compact', newBoardId.toString(), callId);
        }
      }
    } catch (error) {
      console.error('❌ Error creating new board:', error);
    }
  };

  const handleConfirm = () => {
    if (selectedBoardId) {
      // Обновляем локальный режим и сохраняем информацию о доске
      updateStore('mode', 'compact');
      updateStore('activeBoardId', selectedBoardId.toString());
      updateStore('activeClassroom', callId);

      // Если включен режим совместной работы, отправляем сообщение всем участникам
      if (isCollaborativeMode) {
        syncModeToOthers('compact', selectedBoardId.toString(), callId);
      }

      // Переходим на доску
      if (callId) {
        navigate({
          to: '/classrooms/$classroomId/boards/$boardId',
          params: { classroomId: callId, boardId: selectedBoardId.toString() },
          search: { call: callId },
        });
      } else {
        navigate({
          to: '/board/$boardId',
          params: { boardId: selectedBoardId.toString() },
        });
      }

      onOpenChange(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[680px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <ModalHeader className="border-gray-20 border-b">
          <ModalTitle>Доска для совместной работы</ModalTitle>
          <Input
            before={<Search className="fill-gray-60" />}
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </ModalHeader>

        <div className="py-4 pr-2 pl-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-60">Загрузка досок...</p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-red-500">Ошибка загрузки досок</p>
            </div>
          ) : (
            <ScrollArea className="h-full max-h-[400px] w-full">
              <div className="space-y-4 pr-4">
                {filteredWhiteboards.map((board) => (
                  <div
                    key={board.id}
                    className={`hover:bg-gray-5 flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 ${
                      selectedBoardId === board.id ? 'border-brand-100 bg-brand-0' : ''
                    }`}
                    onClick={() => handleBoardSelect(board.id)}
                  >
                    {/* Бейдж статуса доступа, как в CardMaterials */}
                    {board.student_access_mode && (
                      <Badge
                        variant="default"
                        className={
                          board.student_access_mode === 'read_write'
                            ? 'text-s-base bg-gray-10 text-gray-60 px-2 py-1 font-medium'
                            : board.student_access_mode === 'read_only'
                              ? 'text-s-base bg-cyan-20 px-2 py-1 font-medium text-cyan-100'
                              : 'text-s-base bg-violet-20 px-2 py-1 font-medium text-violet-100'
                        }
                      >
                        {board.student_access_mode === 'read_write'
                          ? 'совместная работа'
                          : board.student_access_mode === 'read_only'
                            ? 'только репетитор'
                            : 'черновик'}
                      </Badge>
                    )}
                    <h3 className="text-m-base text-gray-100">{board.name}</h3>
                    <p className="text-xs-base text-gray-60">
                      Изменено: {new Date(board.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <div
                  className="bg-brand-0 group flex h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-4"
                  onClick={handleCreateNewBoard}
                >
                  <h3 className="text-s-base text-brand-100 group-hover:text-brand-80">
                    {addClassroomMaterials.isPending ? 'Создание...' : 'Создать новую'}
                  </h3>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <ModalFooter className="border-gray-20 flex flex-col gap-4 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              id="collaborative-mode"
              checked={isCollaborativeMode}
              onCheckedChange={(checked) => setIsCollaborativeMode(checked === true)}
            />
            <label
              htmlFor="collaborative-mode"
              className="text-s-base cursor-pointer text-gray-100"
            >
              Открыть доску в режиме совместной работы
              <br />
              для всех участников звонка
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="m" onClick={handleConfirm} disabled={!selectedBoardId}>
              Выбрать
            </Button>
            <Button size="m" variant="secondary" onClick={() => onOpenChange(false)}>
              Отменить
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
