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
import { useTranslation } from 'react-i18next';

type ModalStudentsGroupProps = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

export const ModalStudentsGroup = ({ children, open, onOpenChange }: ModalStudentsGroupProps) => {
  const { t } = useTranslation('groupManage');
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });

  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isModalOpen = isControlled ? Boolean(open) : uncontrolledOpen;

  const setModalOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
    if (!next) cleanupBodyScrollLock();
  };

  const handleClose = () => setModalOpen(false);

  useEffect(() => {
    if (!isModalOpen) cleanupBodyScrollLock();
    return cleanupBodyScrollLock;
  }, [isModalOpen]);

  const {
    data: allStudents,
    isLoading: isLoadingAllStudents,
    isError: isErrorAllStudents,
  } = useStudentsList({ disabled: !isModalOpen });
  const {
    data: groupStudents,
    isLoading: isLoadingGroupStudents,
    isError: isErrorGroupStudents,
  } = useGroupStudentsList(classroomId, { disabled: !isModalOpen });

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
      toast.success(t('toast.saved'));
    }
  };

  const isLoading = isLoadingAllStudents || isLoadingGroupStudents;
  const isError = isErrorAllStudents || isErrorGroupStudents;
  const students = allStudents ?? [];
  const isEmpty = !isLoading && !isError && students.length === 0;

  return (
    <Modal open={isModalOpen} onOpenChange={setModalOpen}>
      {children && <ModalTrigger asChild>{children}</ModalTrigger>}
      <ModalContent aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton onClick={handleClose} />
          <ModalTitle className="font-playfair text-text-primary m-0 max-w-[calc(100%-48px)] text-2xl leading-normal font-medium">
            {t('title')}
          </ModalTitle>
        </ModalHeader>
        <ModalBody className={cn('flex flex-col gap-4 px-2 pt-2')}>
          <ScrollArea className="h-[300px]">
            <div className="flex h-full min-h-[300px] flex-col">
              {isLoading && (
                <div className="flex min-h-[300px] items-center justify-center">
                  <span className="text-text-secondary">{t('loading')}</span>
                </div>
              )}
              {isError && (
                <div className="flex min-h-[300px] items-center justify-center">
                  <span className="text-text-danger">{t('loadError')}</span>
                </div>
              )}
              {isEmpty && (
                <div
                  className={cn(
                    'border-border-default bg-background-surface dark:border-border-strong',
                    'mx-2 flex min-h-[280px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center',
                  )}
                >
                  <p className="text-m-base text-text-primary font-semibold">{t('empty.title')}</p>
                  <p className="text-s-base text-text-secondary dark:text-text-muted max-w-sm">
                    {t('empty.description')}
                  </p>
                </div>
              )}
              {!isLoading &&
                !isError &&
                students.map((student: TutorStudentSchemaMarshal) => (
                  <div
                    key={student.tutorship.student_id}
                    className="group hover:bg-background-page flex h-[48px] cursor-pointer flex-row items-center gap-2 rounded-2xl px-4"
                    onClick={() => handleStudentToggle(student.tutorship.student_id)}
                    data-umami-event="group-student-toggle"
                    data-umami-event-student-id={student.tutorship.student_id}
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
            disabled={
              isEmpty || isSaving || addStudentMutation.isPending || deleteStudentMutation.isPending
            }
            data-umami-event="group-students-save"
          >
            {isSaving ? t('actions.saving') : t('actions.save')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (isEmpty) {
                handleClose();
                return;
              }
              // Сброс к исходному состоянию
              if (groupStudents && Array.isArray(groupStudents)) {
                const groupStudentIds = new Set(
                  groupStudents.map((student) => student.tutorship.student_id),
                );
                setSelectedStudents(groupStudentIds);
              }
            }}
            data-umami-event="group-students-cancel"
          >
            {t('actions.cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
