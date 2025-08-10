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
import { useState } from 'react';
import { Close, Search } from '@xipkg/icons';
import { useNavigate } from '@tanstack/react-router';
import { useCallStore } from '../../store';
import { useModeSync } from '../../hooks';

type Whiteboard = {
  id: string;
  title: string;
  lastModified: Date;
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
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [whiteboards] = useState<Whiteboard[]>([
    {
      id: '1',
      title: 'Доска 1',
      lastModified: new Date('2024-03-20'),
    },
    {
      id: '2',
      title: 'Доска 2',
      lastModified: new Date('2024-03-19'),
    },
  ]);

  const filteredWhiteboards = whiteboards.filter((board) =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBoardSelect = (boardId: string) => {
    setSelectedBoardId(boardId);
  };

  const handleConfirm = () => {
    if (selectedBoardId) {
      console.log('🎯 WhiteboardsModal: handleConfirm called with boardId:', selectedBoardId);

      // Обновляем локальный режим
      updateStore('mode', 'compact');
      console.log('✅ Local mode updated to compact');

      // Отправляем сообщение всем участникам ВКС о переключении в compact режим
      syncModeToOthers('compact', selectedBoardId);
      console.log('📤 Mode sync message sent to all participants');

      // Переходим на доску
      navigate({ to: '/board/$boardId', params: { boardId: selectedBoardId } });
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

        <div className="px-6 py-4">
          <div className="space-y-4">
            {filteredWhiteboards.map((board) => (
              <div
                key={board.id}
                className={`hover:bg-gray-5 flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 ${
                  selectedBoardId === board.id ? 'border-brand-100 bg-brand-0' : ''
                }`}
                onClick={() => handleBoardSelect(board.id)}
              >
                <h3 className="text-m-base text-gray-100">{board.title}</h3>
                <p className="text-xs-base text-gray-60">
                  Изменено: {board.lastModified.toLocaleDateString()}
                </p>
              </div>
            ))}
            <div className="bg-brand-0 group flex h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-4">
              <h3 className="text-s-base text-brand-100 group-hover:text-brand-80">
                Создать новую
              </h3>
            </div>
          </div>
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
