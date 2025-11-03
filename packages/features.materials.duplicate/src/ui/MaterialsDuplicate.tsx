import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
  ModalDescription,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { ScrollArea } from '@xipkg/scrollarea';
import { Close } from '@xipkg/icons';
import {
  useFetchClassrooms,
  useStudentById,
  useGetMaterial,
  useDuplicateMaterial,
} from 'common.services';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';

type AccessModeT = 'no_access' | 'read_only' | 'read_write';

type ClassroomT = {
  id: number;
  name: string;
  kind: 'individual' | 'group';
  status: string;
  subject_id: number | null;
  student_id?: number;
};

type MaterialsDuplicateProps = {
  materialId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ClassroomCardProps = {
  classroom: ClassroomT;
  isSelected: boolean;
  onSelect: () => void;
};

const ClassroomCard = ({ classroom, isSelected, onSelect }: ClassroomCardProps) => {
  const isIndividual = classroom.kind === 'individual';
  const studentId = isIndividual && 'student_id' in classroom ? classroom.student_id : null;
  const { data: student, isLoading: isLoadingStudent } = useStudentById(
    studentId || 0,
    !isIndividual || !studentId,
  );

  return (
    <div
      className={`hover:bg-gray-5 flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
        isSelected ? 'border-brand-100 bg-brand-0' : ''
      }`}
      onClick={onSelect}
    >
      {isIndividual && studentId ? (
        <Avatar size="m">
          <AvatarImage
            src={`https://api.sovlium.ru/files/users/${studentId}/avatar.webp`}
            alt="user avatar"
          />
          {isLoadingStudent ? (
            <AvatarFallback size="m" loading />
          ) : (
            <AvatarFallback size="m">
              {student?.display_name?.[0]?.toUpperCase() || classroom.name[0]?.toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      ) : (
        <div className="bg-brand-80 text-gray-0 flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full text-sm font-medium">
          {classroom.name[0]?.toUpperCase() || ''}
        </div>
      )}
      <h3 className="text-m-base line-clamp-2 flex-1 text-gray-100">{classroom.name}</h3>
    </div>
  );
};

export const MaterialsDuplicate = ({ materialId, open, onOpenChange }: MaterialsDuplicateProps) => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
  const [studentAccessMode, setStudentAccessMode] = useState<AccessModeT>('read_write');

  const { data: material, isLoading: isMaterialLoading } = useGetMaterial({
    id: materialId.toString(),
    disabled: !open || !materialId,
  });

  const { duplicateMaterial } = useDuplicateMaterial();

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

  const getMaterialTypeLabel = (isTitle: boolean) => {
    if (!material) return 'материал';

    if (isTitle) {
      return material.content_kind === 'board' ? 'доску' : 'заметку';
    }

    return material.content_kind === 'board' ? 'доски' : 'заметки';
  };

  const getModalTitle = () => {
    if (isMaterialLoading || !material) {
      return 'Дублировать материал';
    }
    return `Дублировать ${getMaterialTypeLabel(true)}`;
  };

  const handleConfirm = () => {
    if (selectedClassroomId && material) {
      duplicateMaterial.mutate(
        {
          classroomId: selectedClassroomId.toString(),
          name: material.name,
          student_access_mode: studentAccessMode,
          source_id: materialId,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            setSelectedClassroomId(null);
            setStudentAccessMode('read_write');
          },
        },
      );
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedClassroomId(null);
      setStudentAccessMode('read_write');
    }
    onOpenChange(newOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-2xl">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <ModalHeader className="border-gray-20 border-b">
          <ModalTitle>{getModalTitle()}</ModalTitle>
          <ModalDescription>
            Выберите кабинет, в нём будет создана копия {getMaterialTypeLabel(false)}
          </ModalDescription>
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
              <div className="grid grid-cols-1 gap-4 pr-4 sm:grid-cols-2">
                {classrooms?.map((classroom) => (
                  <ClassroomCard
                    key={classroom.id}
                    classroom={classroom}
                    isSelected={selectedClassroomId === classroom.id}
                    onSelect={() => handleClassroomSelect(classroom.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <ModalFooter className="border-gray-20 flex flex-col gap-4 border-t">
          <div className="w-full">
            <p className="text-s-base text-gray-60 mb-1">Тип доступа к материалу в кабинете</p>
            <Select
              value={studentAccessMode}
              onValueChange={(value) => setStudentAccessMode(value as AccessModeT)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите тип доступа к материалу в кабинете" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="read_write">Совместная работа</SelectItem>
                <SelectItem value="read_only">Только репетитор</SelectItem>
                <SelectItem value="no_access">Черновик</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              size="m"
              onClick={handleConfirm}
              disabled={!selectedClassroomId || duplicateMaterial.isPending}
            >
              {duplicateMaterial.isPending ? 'Дублирование...' : 'Дублировать'}
            </Button>
            <Button size="m" variant="secondary" onClick={() => handleClose(false)}>
              Отменить
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
