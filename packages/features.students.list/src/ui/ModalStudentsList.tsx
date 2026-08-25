import { Button } from '@xipkg/button';
import { Search, Trash, UserPlus } from '@xipkg/icons';
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
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from 'common.ui';
import { useDeleteStudent } from '../services';
import { useStudentsList } from 'common.services';
import { TutorStudentSchemaMarshal } from 'common.types';
import { matchesSearchQuery } from 'common.utils';

type ModalStudentsListProps = {
  children: ReactNode;
  onInviteStudent?: () => void;
};

export const ModalStudentsList = ({ children, onInviteStudent }: ModalStudentsListProps) => {
  const { t } = useTranslation('studentsList');
  const [isOpen, setIsOpen] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students, isLoading, isError } = useStudentsList();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();

  const selectedStudentData = students?.find(
    (student: TutorStudentSchemaMarshal) => student.tutorship.student_id === selectedStudent,
  );
  const selectedStudentName =
    selectedStudentData?.user.display_name || selectedStudentData?.user.username || '';

  const handleDeleteMode = (studentId: number) => {
    setSelectedStudent(studentId);
    setIsDelete(true);
  };

  const handleDelete = () => {
    if (selectedStudent) {
      deleteStudent(selectedStudent, {
        onSuccess: () => {
          setIsDelete(false);
          setSelectedStudent(null);
        },
      });
    }
  };

  const filteredStudents =
    students?.filter(
      (student: TutorStudentSchemaMarshal) =>
        matchesSearchQuery(student.user.display_name, searchQuery) ||
        matchesSearchQuery(student.user.username, searchQuery),
    ) || [];

  const handleInviteStudent = () => {
    setIsOpen(false);
    onInviteStudent?.();
  };

  return (
    <>
      <Modal
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setIsDelete(false);
        }}
      >
        <ModalTrigger asChild>{children}</ModalTrigger>
        <ModalContent onClose={() => setIsDelete(false)} aria-describedby={undefined}>
          <ModalHeader>
            <ModalCloseButton />
            <ModalTitle className="text-text-primary max-w-[calc(100%-48px)]">
              {t('title')}
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 px-2 pt-2">
            <div className="flex flex-col gap-2 px-2">
              <Input
                placeholder={t('search')}
                before={<Search className="fill-icon-secondary" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col">
                {isLoading && (
                  <div className="flex h-20 items-center justify-center">
                    <span className="text-text-secondary">{t('loading')}</span>
                  </div>
                )}
                {isError && (
                  <div className="flex h-20 items-center justify-center">
                    <span className="text-text-danger">{t('loadError')}</span>
                  </div>
                )}
                {!isLoading && !isError && filteredStudents.length === 0 && (
                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-4">
                    <span className="text-text-secondary">
                      {searchQuery ? t('notFound') : t('empty')}
                    </span>
                    {!searchQuery && onInviteStudent && (
                      <Button
                        type="button"
                        variant="primary"
                        size="s"
                        className="gap-1.5"
                        onClick={handleInviteStudent}
                        data-umami-event="students-list-invite"
                      >
                        <UserPlus className="fill-action-primary-text text-text-on-accent size-4 shrink-0" />
                        {t('inviteStudent')}
                      </Button>
                    )}
                  </div>
                )}
                {!isLoading &&
                  !isError &&
                  filteredStudents.map((student: TutorStudentSchemaMarshal) => (
                    <div
                      key={student.tutorship.student_id}
                      className="group hover:bg-background-page flex h-[48px] flex-row items-center gap-2 rounded-2xl px-4"
                    >
                      <UserProfile
                        text={student.user.display_name || student.user.username}
                        userId={student.tutorship.student_id}
                      />
                      <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleDeleteMode(student.tutorship.student_id)}
                            className="bg-background-page hover:bg-background-surface ml-auto size-8 rounded-lg p-0"
                            variant="none"
                            size="s"
                            data-umami-event="student-delete-init"
                            data-umami-event-student-id={student.tutorship.student_id}
                          >
                            <Trash className="fill-icon-primary size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>{t('deleteTooltip')}</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </ModalBody>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={isDelete}
        onOpenChange={(open) => {
          setIsDelete(open);
          if (!open) setSelectedStudent(null);
        }}
        title={t('deleteConfirm.title')}
        description={t('deleteConfirm.description', { name: selectedStudentName })}
        confirmLabel={isDeleting ? t('actions.deleting') : t('actions.delete')}
        cancelLabel={t('actions.cancel')}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
};
