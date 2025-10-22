/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-irregular-whitespace */
import { useState, useEffect } from 'react';
import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalTrigger,
  ModalCloseButton,
  ModalFooter,
} from '@xipkg/modal';
import { ScrollArea } from '@xipkg/scrollarea';
import { UserProfile } from '@xipkg/userprofile';
import { Checkbox } from '@xipkg/checkbox';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { TutorStudentSchemaMarshal } from 'common.types';
import { useStudentsList } from 'common.services';
import { useAddStudentFromGroup, useDeleteStudentFromGroup } from '../services';
import { useGroupStudentsList } from 'common.services';
import { useParams } from '@tanstack/react-router';
import { toast } from 'sonner';

type ModalStudentsGroupProps = {
  children: React.ReactNode;
};

export const ModalStudentsGroup = ({ children }: ModalStudentsGroupProps) => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });

  const {
    data: allStudents,
    isLoading: isLoadingAllStudents,
    isError: isErrorAllStudents,
  } = useStudentsList();
  const {
    data: groupStudents,
    isLoading: isLoadingGroupStudents,
    isError: isErrorGroupStudents,
  } = useGroupStudentsList(classroomId);

  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const addStudentMutation = useAddStudentFromGroup({ classroom_id: classroomId });
  const deleteStudentMutation = useDeleteStudentFromGroup({ classroom_id: classroomId });

  // Инициализация выбранных студентов на основе студентов в группе
  useEffect(() => {
    if (groupStudents && Array.isArray(groupStudents)) {
      const groupStudentIds = new Set(groupStudents.map((student) => student.user_id));
      setSelectedStudents(groupStudentIds);
    }
  }, [groupStudents]);

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!groupStudents || !allStudents) return;

    setIsSaving(true);

    try {
      const currentGroupStudentIds = new Set(groupStudents.map((student: any) => student.user_id));
      const studentsToAdd: number[] = [];
      const studentsToRemove: number[] = [];

      // Находим студентов для добавления
      selectedStudents.forEach((studentId: number) => {
        if (!currentGroupStudentIds.has(studentId)) {
          studentsToAdd.push(studentId);
        }
      });

      // Находим студентов для удаления
      Array.from(currentGroupStudentIds).forEach((studentId) => {
        if (!selectedStudents.has(studentId as number)) {
          studentsToRemove.push(studentId as number);
        }
      });

      // Выполняем мутации
      const addPromises = studentsToAdd.map((studentId: number) =>
        addStudentMutation.mutateAsync(studentId),
      );

      const deletePromises = studentsToRemove.map((studentId: number) =>
        deleteStudentMutation.mutateAsync(studentId),
      );

      await Promise.all([...addPromises, ...deletePromises]);
    } catch (error) {
      console.error('Ошибка при сохранении изменений:', error);
    } finally {
      setIsSaving(false);
      toast.success('Изменения сохранены');
    }
  };

  const isLoading = isLoadingAllStudents || isLoadingGroupStudents;
  const isError = isErrorAllStudents || isErrorGroupStudents;

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="dark:text-gray-100">Добавление ученика в группу</ModalTitle>
        </ModalHeader>
        <ModalBody className={cn('flex flex-col gap-4 px-2 pt-2')}>
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col">
              {isLoading && (
                <div className="flex h-20 items-center justify-center">
                  <span className="text-gray-60">Загрузка...</span>
                </div>
              )}
              {isError && (
                <div className="flex h-20 items-center justify-center">
                  <span className="text-red-500">Ошибка загрузки данных</span>
                </div>
              )}
              {!isLoading && !isError && allStudents?.length === 0 && (
                <div className="flex h-20 items-center justify-center">
                  <span className="text-gray-60">{'У вас пока нет студентов'}</span>
                </div>
              )}
              {!isLoading &&
                !isError &&
                allStudents?.map((student: TutorStudentSchemaMarshal) => (
                  <div
                    key={student.tutorship.student_id}
                    className="group hover:bg-gray-5 flex h-[48px] cursor-pointer flex-row items-center gap-2 rounded-2xl px-4"
                    onClick={() => handleStudentToggle(student.tutorship.student_id)}
                  >
                    <Checkbox checked={selectedStudents.has(student.tutorship.student_id)} />
                    <UserProfile
                      text={student.user.display_name || student.user.username}
                      userId={student.tutorship.student_id}
                    />
                  </div>
                ))}
            </div>
          </ScrollArea>
        </ModalBody>
        <ModalFooter className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || addStudentMutation.isPending || deleteStudentMutation.isPending}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Сброс к исходному состоянию
              if (groupStudents && Array.isArray(groupStudents)) {
                const groupStudentIds = new Set(
                  groupStudents.map((student) => student.tutorship.student_id),
                );
                setSelectedStudents(groupStudentIds);
              }
            }}
          >
            Отмена
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
