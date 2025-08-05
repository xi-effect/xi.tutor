import { Button } from '@xipkg/button';
import { Search, WhiteBoard } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { ScrollArea } from '@xipkg/scrollarea';
import { useDebounce } from '@xipkg/utils';
import { useEffect, useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@xipkg/modal';

const mockWhiteboardList = [
  {
    name: 'Доска 1',
  },
  {
    name: 'Новая доска',
  },
  {
    name: 'Доска 3',
  },
  {
    name: 'Доска 4',
  },
  {
    name: 'Математика',
  },
  {
    name: 'Доска 2',
  },
  {
    name: 'Доска 5',
  },
  {
    name: 'Новая доска 2',
  },
  {
    name: 'Доска 6',
  },
  {
    name: 'Доска 7',
  },
  {
    name: 'Доска 8',
  },
  {
    name: 'Математика',
  },
];

export const WhiteboardModal = () => {
  const [filteredBoards, setFilteredBoards] = useState(mockWhiteboardList);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setFilteredBoards(
        mockWhiteboardList.filter((board) =>
          board.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        ),
      );
    } else {
      setFilteredBoards(mockWhiteboardList);
    }
  }, [debouncedSearchTerm]);

  const handleCancel = () => {
    setIsOpen(false);
    setSearchTerm('');
    setFilteredBoards(mockWhiteboardList);
  };

  return (
    <Modal open={isOpen}>
      <ModalTrigger asChild>
        <Button
          variant="ghost"
          size="s"
          className="hover:bg-gray-10"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <WhiteBoard />
        </Button>
      </ModalTrigger>
      <ModalContent variant="default" className="md:w-170 md:!max-w-170">
        <ModalHeader headerVariant="default">
          <ModalTitle className="pr-10 sm:pr-0">Доска для совместной работы</ModalTitle>
          <Input
            placeholder="Поиск"
            before={<Search className="text-gray-60 h-4 w-4" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <ModalCloseButton variant="default" onClick={handleCancel} />
        </ModalHeader>
        <ModalBody>
          <ScrollArea className="max-h-66.5 min-h-43 w-full rounded-md">
            <div className="flex flex-wrap gap-4">
              <div className="bg-brand-0 flex h-19.5 w-full items-center justify-center rounded-2xl md:w-50">
                <span className="text-brand-100 text-s-base">Создать новую</span>
              </div>
              {filteredBoards.map((board, index) => (
                <div
                  key={index}
                  className="border-gray-40 flex h-19.5 w-full flex-col items-start justify-start gap-2 rounded-2xl border p-3 md:w-50"
                >
                  <h3 className="text-m-base font-medium text-gray-100">{board.name}</h3>
                  <span className="text-xs-base text-gray-80 font-medium">Изменено: 5 августа</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </ModalBody>
        <ModalFooter footerVariant="default">
          <div className="flex gap-4">
            <Button type="submit">Выбрать</Button>
            <Button variant="secondary" onClick={handleCancel}>
              Отмена
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
