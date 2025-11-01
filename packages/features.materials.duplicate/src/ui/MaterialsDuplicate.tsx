import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { ScrollArea } from '@xipkg/scrollarea';
import { Close } from '@xipkg/icons';
import { useFetchClassrooms } from 'common.services';
import { useState } from 'react';

// Типы материалов определены в common.types -> ClassroomMaterialsT

type MaterialsDuplicateProps = {
  materialId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MaterialsDuplicate = ({ materialId, open, onOpenChange }: MaterialsDuplicateProps) => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);

  const handleClassroomSelect = (classroomId: number) => {
    setSelectedClassroomId(classroomId);
  };

  const {
    data: classrooms,
    isLoading,
    isError,
  } = useFetchClassrooms({
    limit: 100,
  });

  console.log('MaterialsDuplicate: classrooms', classrooms);
  console.log('MaterialsDuplicate: materialId', materialId);

  const handleConfirm = () => {
    if (selectedClassroomId) {
      console.log(
        '🎯 MaterialsDuplicate: handleConfirm called with classroomId:',
        selectedClassroomId,
      );
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[680px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <ModalHeader className="border-gray-20 border-b">
          <ModalTitle>Дублировать материал</ModalTitle>
        </ModalHeader>

        <div className="py-4 pr-2 pl-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-60">Загрузка кабинетов...</p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-red-500">Ошибка загрузки кабинетов</p>
            </div>
          ) : (
            <ScrollArea className="h-full max-h-[400px] w-full">
              <div className="space-y-4 pr-4">
                {classrooms?.map((classroom) => (
                  <div
                    key={classroom.id}
                    className={`hover:bg-gray-5 flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 ${
                      selectedClassroomId === classroom.id ? 'border-brand-100 bg-brand-0' : ''
                    }`}
                    onClick={() => handleClassroomSelect(classroom.id)}
                  >
                    <h3 className="text-m-base text-gray-100">{classroom.name}</h3>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <ModalFooter className="border-gray-20 flex flex-col gap-4 border-t">
          <div className="flex gap-2">
            <Button size="m" onClick={handleConfirm} disabled={!selectedClassroomId}>
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
