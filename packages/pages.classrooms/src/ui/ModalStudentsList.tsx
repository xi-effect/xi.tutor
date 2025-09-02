import { Button } from '@xipkg/button';
import { Search, Trash } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalTrigger,
  ModalCloseButton,
} from '@xipkg/modal';
import { ScrollArea } from '@xipkg/scrollarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';
import { useState } from 'react';

export const ModalStudentsList = ({ children }: { children: React.ReactNode }) => {
  const [isDelete, setIsDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const handleDeleteMode = (value: number) => {
    setSelectedStudent(value);
    setIsDelete(true);
  };

  const handleDelete = () => {
    if (selectedStudent) {
      console.log(selectedStudent);
    }
  };

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent onClose={() => setIsDelete(false)}>
        {!isDelete && (
          <ModalHeader>
            <ModalCloseButton />
            <ModalTitle className="dark:text-gray-100">Список учеников</ModalTitle>
          </ModalHeader>
        )}
        <ModalBody className={cn('flex flex-col gap-4 px-2 pt-2', isDelete && 'w-full gap-1 p-8')}>
          {!isDelete && (
            <>
              <div className="flex flex-col gap-2 px-2">
                <Input placeholder="Поиск" before={<Search className="fill-gray-60" />} />
              </div>
              <ScrollArea className="h-[300px]">
                <div className="flex flex-col">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="group hover:bg-gray-5 flex h-[48px] flex-row items-center gap-2 rounded-2xl px-4"
                    >
                      <UserProfile text="Иван Иванов" userId={index} />
                      <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleDeleteMode(index)}
                            className="bg-gray-5 hover:bg-gray-0 ml-auto hidden size-8 rounded-lg p-0 group-hover:flex"
                            variant="ghost"
                            size="s"
                          >
                            <Trash className="size-4 fill-gray-100" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Удалить ученика из вашего пространства</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
          {isDelete && (
            <>
              <span className="text-xl-base text self-center font-semibold text-gray-100">
                Удалить ученика?
              </span>
              <span className="text-l-base text-gray-60 w-[300px] self-center text-center">
                Если решите возобновить занятия, ученика придется приглашать заново
              </span>
              <div className="mt-3 flex flex-col gap-2">
                <Button
                  onClick={handleDelete}
                  className="w-full rounded-2xl"
                  variant="error"
                  size="l"
                >
                  Удалить
                </Button>
                <Button
                  onClick={() => setIsDelete(false)}
                  className="w-full rounded-2xl"
                  variant="ghost"
                  size="l"
                >
                  Отмена
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
