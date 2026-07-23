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
import {
  useFetchClassrooms,
  useStudentById,
  useGetMaterial,
  useDuplicateMaterial,
} from 'common.services';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { cn } from '@xipkg/utils';

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

type ClassroomsListProps = {
  isLoading: boolean;
  isError: boolean;
  classrooms: ClassroomT[] | undefined;
  selectedClassroomId: number | null;
  onClassroomSelect: (classroomId: number) => void;
};

const ClassroomsList = ({
  isLoading,
  isError,
  classrooms,
  selectedClassroomId,
  onClassroomSelect,
}: ClassroomsListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-secondary">Загрузка кабинетов...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-danger">Ошибка загрузки кабинетов</p>
      </div>
    );
  }

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center gap-2">
        <p className="text-m-base text-text-secondary w-full text-center">Здесь пока пусто</p>
        <p className="text-m-base text-text-secondary w-full text-center">
          Создайте кабинеты, пригласив учеников на платформу
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full max-h-[400px] w-full">
      <div className="grid grid-cols-1 gap-4 pr-4 sm:grid-cols-2">
        {classrooms.map((classroom) => (
          <ClassroomCard
            key={classroom.id}
            classroom={classroom}
            isSelected={selectedClassroomId === classroom.id}
            onSelect={() => onClassroomSelect(classroom.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
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
      className={cn(
        'border-border-default hover:bg-background-page flex cursor-pointer items-center gap-3 rounded-2xl border p-4',
        isSelected ? 'border-border-focus bg-status-info-background' : '',
      )}
      onClick={onSelect}
      data-umami-event="material-duplicate-select-classroom"
      data-umami-event-classroom-id={classroom.id}
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
        <div className="bg-action-primary-background-default text-text-on-accent flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full text-sm font-medium">
          {classroom.name[0]?.toUpperCase() || ''}
        </div>
      )}
      <h3 className="text-m-base text-text-primary line-clamp-2 flex-1">{classroom.name}</h3>
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
      <ModalContent className="w-full max-w-2xl max-sm:w-[calc(100vw-32px)]">
        <ModalCloseButton className="right-2" />
        <ModalHeader className="border-border-default border-b">
          <ModalTitle className="text-text-primary max-w-[calc(100%-48px)]">
            {getModalTitle()}
          </ModalTitle>
          <ModalDescription>
            Выберите кабинет, в нём будет создана копия {getMaterialTypeLabel(false)}
          </ModalDescription>
        </ModalHeader>

        <div className="min-h-[300px] py-4 pr-2 pl-6 max-sm:min-h-[240px] max-sm:py-3 max-sm:pr-3 max-sm:pl-3">
          <ClassroomsList
            isLoading={isLoading}
            isError={isError}
            classrooms={classrooms}
            selectedClassroomId={selectedClassroomId}
            onClassroomSelect={handleClassroomSelect}
          />
        </div>
        <ModalFooter className="border-border-default flex flex-col gap-4 border-t">
          <div className="w-full">
            <p className="text-s-base text-text-primary mb-1">Тип доступа к материалу в кабинете</p>
            <Select
              value={studentAccessMode}
              onValueChange={(value) => setStudentAccessMode(value as AccessModeT)}
            >
              <SelectTrigger
                className="text-text-primary w-full"
                data-umami-event="material-duplicate-access-selector"
              >
                <SelectValue
                  placeholder="Выберите тип доступа к материалу в кабинете"
                  className="data-placeholder:text-text-disabled text-text-primary"
                />
              </SelectTrigger>
              <SelectContent className="border-border-default bg-background-surface w-full">
                <SelectItem
                  value="read_write"
                  className="text-text-primary focus:text-text-primary data-highlighted:text-text-primary"
                  data-umami-event="material-duplicate-access-mode"
                  data-umami-event-mode="read_write"
                >
                  Совместная работа
                </SelectItem>
                <SelectItem
                  value="read_only"
                  className="text-text-primary focus:text-text-primary data-highlighted:text-text-primary"
                  data-umami-event="material-duplicate-access-mode"
                  data-umami-event-mode="read_only"
                >
                  Только репетитор
                </SelectItem>
                <SelectItem
                  value="no_access"
                  className="text-text-primary focus:text-text-primary data-highlighted:text-text-primary"
                  data-umami-event="material-duplicate-access-mode"
                  data-umami-event-mode="no_access"
                >
                  Черновик
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 max-sm:flex-col max-sm:gap-3">
            <Button
              size="m"
              onClick={handleConfirm}
              disabled={!selectedClassroomId || duplicateMaterial.isPending}
              className="disabled:text-text-secondary w-full sm:w-fit"
              data-umami-event="material-duplicate-confirm"
            >
              {duplicateMaterial.isPending ? 'Дублирование...' : 'Дублировать'}
            </Button>
            <Button
              size="m"
              variant="none"
              onClick={() => handleClose(false)}
              className="bg-background-page hover:bg-background-subtle text-text-primary h-12 w-full sm:w-fit"
              data-umami-event="material-duplicate-cancel"
            >
              Отменить
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
