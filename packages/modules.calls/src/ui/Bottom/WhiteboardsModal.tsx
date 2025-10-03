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
import { useState } from 'react';
import { Close, Search } from '@xipkg/icons';
import { useNavigate } from '@tanstack/react-router';
import { useCallStore } from '../../store';
import { useModeSync, useWhiteboards } from '../../hooks';

type Whiteboard = {
  id: number;
  name: string;
  kind: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
};

type WhiteboardsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const WhiteboardsModal = ({ open, onOpenChange }: WhiteboardsModalProps) => {
  const navigate = useNavigate();
  const updateStore = useCallStore((state) => state.updateStore);
  const { syncModeToOthers } = useModeSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const { whiteboards, isLoading, isError } = useWhiteboards(20);

  const filteredWhiteboards =
    whiteboards &&
    Array.isArray(whiteboards) &&
    whiteboards.filter((board: Whiteboard) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const handleBoardSelect = (boardId: number) => {
    setSelectedBoardId(boardId);
  };

  const handleConfirm = () => {
    if (selectedBoardId) {
      console.log('🎯 WhiteboardsModal: handleConfirm called with boardId:', selectedBoardId);

      // Обновляем локальный режим
      updateStore('mode', 'compact');
      console.log('✅ Local mode updated to compact');

      // Отправляем сообщение всем участникам ВКС о переключении в compact режим
      syncModeToOthers('compact', selectedBoardId.toString());
      console.log('📤 Mode sync message sent to all participants');

      // Переходим на доску
      navigate({ to: '/board/$boardId', params: { boardId: selectedBoardId.toString() } });
      console.log('🧭 Navigation to board initiated');

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
                {filteredWhiteboards.map((board: Whiteboard) => (
                  <div
                    key={board.id}
                    className={`hover:bg-gray-5 flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 ${
                      selectedBoardId === board.id ? 'border-brand-100 bg-brand-0' : ''
                    }`}
                    onClick={() => handleBoardSelect(board.id)}
                  >
                    <h3 className="text-m-base text-gray-100">{board.name}</h3>
                    <p className="text-xs-base text-gray-60">
                      Изменено: {new Date(board.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <div className="bg-brand-0 group flex h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-4">
                  <h3 className="text-s-base text-brand-100 group-hover:text-brand-80">
                    Создать новую
                  </h3>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <ModalFooter className="border-gray-20 flex gap-2 border-t">
          <Button size="m" onClick={handleConfirm} disabled={!selectedBoardId}>
            Выбрать
          </Button>
          <Button
            size="m"
            variant="secondary"
            onClick={() => {
              console.log('🧪 Testing data channel...');
              syncModeToOthers('compact', 'test-board-123');
            }}
          >
            Тест Data Channel
          </Button>
          <Button size="m" variant="secondary" onClick={() => onOpenChange(false)}>
            Отменить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
