import { Button } from '@xipkg/button';
import { Search, WhiteBoard } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { ScrollArea } from '@xipkg/scrollarea';
import { useDebounce } from '@xipkg/utils';
import { useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@xipkg/modal';
import { WhiteBoardItem } from './WhiteBoardItem';

const mockWhiteBoardList = [
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
];

export const WhiteBoardsModal = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const searchName = useDebounce(searchInput, 300);

  const filteredBoards = mockWhiteBoardList.filter((board) =>
    searchName ? board.name.toLowerCase().includes(searchName.toLowerCase()) : true,
  );

  const handleCancel = () => {
    setIsOpen(false);
    setSearchInput('');
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
            before={<Search className="h-6 w-6" />}
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />
          <ModalCloseButton variant="default" onClick={handleCancel} />
          <ModalDescription />
        </ModalHeader>
        <ModalBody>
          <ScrollArea className={`max-h-67 ${filteredBoards.length > 9 && 'pr-4'}`}>
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBoards.map((board, index) => (
                <WhiteBoardItem name={board.name} key={index} />
              ))}
              <div className="bg-brand-0 hover:border-brand-60 col-span-1 flex h-19.5 items-center justify-center rounded-2xl hover:border">
                <span className="text-brand-100 text-s-base">Создать новую</span>
              </div>
            </div>
          </ScrollArea>
        </ModalBody>
        <ModalFooter footerVariant="default">
          <div className="flex gap-4">
            <Button type="submit" className="w-29.25">
              Выбрать
            </Button>
            <Button variant="secondary" onClick={handleCancel} className="w-27.25">
              Отмена
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
