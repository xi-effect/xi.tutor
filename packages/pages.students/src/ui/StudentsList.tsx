import { type RefObject, useState } from 'react';
import { Button } from '@xipkg/button';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { PersonalData, Trash, UserPlus } from '@xipkg/icons';
import { Tooltip, TooltipTrigger } from '@xipkg/tooltip';
import { useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import {
  ConfirmDialog,
  CardTooltipContent,
  cardMenuButtonClass,
  cardMenuIconClass,
  cardMenuPositionClass,
  cardTypeIconBoxClass,
} from 'common.ui';
import { useStudentsList } from 'common.services';
import { TutorStudentSchemaMarshal } from 'common.types';
import { matchesSearchQuery } from 'common.utils';
import { useDeleteStudent } from 'features.students.list';

type StudentsListProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  searchQuery: string;
  onInviteStudent: () => void;
};

const avatarSize = 'l';

const StudentCard = ({
  student,
  onDelete,
}: {
  student: TutorStudentSchemaMarshal;
  onDelete: (studentId: number) => void;
}) => {
  const { t } = useTranslation('studentsList');
  const name = student.user.display_name || student.user.username;
  const letter = name.trim()[0]?.toUpperCase() ?? '';

  return (
    <div className="group bg-background-surface relative flex h-40 w-full justify-between rounded-2xl p-5">
      <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
        <div className="mr-8 flex min-w-0 items-center gap-2">
          <div className={cardTypeIconBoxClass}>
            <PersonalData aria-label={t('typeLabel')} />
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Avatar size={avatarSize}>
            <AvatarImage
              src={`https://api.sovlium.ru/files/users/${student.tutorship.student_id}/avatar.webp`}
              alt=""
            />
            <AvatarFallback size={avatarSize}>{letter}</AvatarFallback>
          </Avatar>
          <Tooltip delayDuration={2000}>
            <TooltipTrigger asChild>
              <div className="flex h-full w-full flex-row items-center justify-center gap-2">
                <h3 className="text-s-base text-text-primary line-clamp-2 w-full text-left font-medium">
                  {name}
                </h3>
              </div>
            </TooltipTrigger>
            <CardTooltipContent>{name}</CardTooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className={cardMenuPositionClass}>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={() => onDelete(student.tutorship.student_id)}
              className={cardMenuButtonClass}
              variant="none"
              size="icon"
              data-umami-event="student-delete-init"
              data-umami-event-student-id={student.tutorship.student_id}
            >
              <Trash className={cardMenuIconClass} />
            </Button>
          </TooltipTrigger>
          <CardTooltipContent align="end">{t('deleteTooltip')}</CardTooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export const StudentsList = ({
  parentRef,
  enabled,
  searchQuery,
  onInviteStudent,
}: StudentsListProps) => {
  const { t } = useTranslation('studentsList');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const [isDelete, setIsDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const { data: students, isLoading, isError } = useStudentsList({ disabled: !enabled });
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();

  const selectedStudentData = students?.find(
    (student: TutorStudentSchemaMarshal) => student.tutorship.student_id === selectedStudent,
  );
  const selectedStudentName =
    selectedStudentData?.user.display_name || selectedStudentData?.user.username || '';

  const filteredStudents =
    students?.filter(
      (student: TutorStudentSchemaMarshal) =>
        matchesSearchQuery(student.user.display_name, searchQuery) ||
        matchesSearchQuery(student.user.username, searchQuery),
    ) || [];

  const items = filteredStudents.map((student) => ({
    id: student.tutorship.student_id,
    student,
  }));

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

  return (
    <>
      {(isLoading || !enabled) && (
        <div className="flex h-20 items-center justify-center">
          <span className="text-text-secondary">{t('loading')}</span>
        </div>
      )}
      {enabled && isError && (
        <div className="flex h-20 items-center justify-center">
          <span className="text-text-danger">{t('loadError')}</span>
        </div>
      )}
      {enabled && !isLoading && !isError && filteredStudents.length === 0 && (
        <div className="flex min-h-[calc(100dvh-280px)] w-full flex-col items-center justify-center gap-3 px-4 py-16">
          <span className="text-text-secondary">{searchQuery ? t('notFound') : t('empty')}</span>
          {!searchQuery && (
            <Button
              type="button"
              variant="primary"
              size="s"
              className="gap-1.5"
              onClick={onInviteStudent}
              data-umami-event="students-list-invite"
            >
              <UserPlus className="fill-action-primary-text text-text-on-accent size-4 shrink-0" />
              {t('inviteStudent')}
            </Button>
          )}
        </div>
      )}
      {enabled && !isLoading && !isError && items.length > 0 && (
        <GridVirtualizer
          items={items}
          parentRef={parentRef}
          gap={20}
          defaultRowHeight={160}
          minItemWidth={300}
          maxColumns={4}
          isSingleColumn={isMobile}
          renderItem={(item) => (
            <StudentCard
              student={item.student}
              onDelete={(studentId) => {
                setSelectedStudent(studentId);
                setIsDelete(true);
              }}
            />
          )}
        />
      )}

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
