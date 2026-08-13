import { useState } from 'react';
import { UserProfile } from '@xipkg/userprofile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { ModalStudentsGroup, useDeleteStudentFromGroup } from 'features.group.manage';
import { ConfirmDialog, EmptyClassrooms } from 'common.ui';
import { ErrorState } from './ErrorState';
import { GroupStudentsListSchema } from 'common.types';
import { useGroupStudentsList } from 'common.services';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ContactsBadge } from '../Header/components/ContactsBadge';
import { StudentsListSkeleton } from './StudentsListSkeleon';
import { SectionEmptyState } from '../SectionEmptyState';
import { sectionEmptyStateIllustrationClass } from '../sectionEmptyStateIllustrationClass';
import { WidgetCardsCarousel, widgetCardSlotClass } from '../WidgetCardsCarousel';
import { emptyInviteButtonClass } from '../galleryShadowClass';
import { cn } from '@xipkg/utils';

type StudentsListPropsT = {
  classroomId: string;
};

export const StudentsList = ({ classroomId }: StudentsListPropsT) => {
  const { t } = useTranslation('classroom');
  const { data: students, isLoading, isError, refetch } = useGroupStudentsList(classroomId);
  const deleteStudentMutation = useDeleteStudentFromGroup({ classroom_id: classroomId });
  const [studentToDelete, setStudentToDelete] = useState<{
    userId: number;
    name: string;
  } | null>(null);

  if (isLoading) {
    return (
      <WidgetCardsCarousel>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={widgetCardSlotClass}>
            <StudentsListSkeleton className="h-32 w-full" />
          </div>
        ))}
      </WidgetCardsCarousel>
    );
  }

  if (isError || !students) {
    return <ErrorState message={t('overview.studentsLoadError')} onRetry={refetch} />;
  }

  if (students.length === 0) {
    return (
      <SectionEmptyState
        title={t('overview.addStudentTitle')}
        description={t('overview.studentsEmptyDescription')}
        minHeightClass="min-h-[160px]"
        illustration={<EmptyClassrooms className={sectionEmptyStateIllustrationClass} />}
        actions={
          <ModalStudentsGroup>
            <Button type="button" variant="none" className={emptyInviteButtonClass}>
              {t('actions.addStudent')}
            </Button>
          </ModalStudentsGroup>
        }
      />
    );
  }

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudentMutation.mutateAsync(studentToDelete.userId);
      toast.success(t('overview.studentDeleted'));
      setStudentToDelete(null);
    } catch {
      toast.error(t('overview.studentDeleteError'));
    }
  };

  return (
    <>
      <WidgetCardsCarousel>
        {students.map(({ user_id, display_name }: GroupStudentsListSchema) => (
          <div key={user_id} className={widgetCardSlotClass}>
            <div
              className={cn(
                'bg-background-surface relative flex h-full min-h-[120px] w-full flex-col justify-between rounded-2xl p-5',
                'shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]',
              )}
            >
              <div className="flex items-center gap-2 pr-8">
                <UserProfile
                  userId={user_id}
                  withOutText
                  src={`https://api.sovlium.ru/files/users/${user_id}/avatar.webp`}
                  size="l"
                />
                <h3 className="text-m-base text-text-primary line-clamp-1 font-medium">
                  {display_name}
                </h3>
              </div>
              <ContactsBadge userId={user_id} />
              <div className="absolute top-4 right-4 flex h-8 w-8 rounded-full">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 rounded-md" variant="none" size="icon">
                      <MoreVert className="dark:fill-icon-primary h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    align="end"
                    className="border-border-default bg-background-surface border p-1"
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        setStudentToDelete({ userId: user_id, name: display_name ?? '' });
                      }}
                    >
                      {t('actions.deleteFromGroup')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </WidgetCardsCarousel>

      <ConfirmDialog
        open={studentToDelete != null}
        onOpenChange={(open) => {
          if (!open) setStudentToDelete(null);
        }}
        title={t('actions.deleteStudentConfirmTitle')}
        description={t('actions.deleteStudentConfirmDescription', {
          name: studentToDelete?.name ?? '',
        })}
        confirmLabel={
          deleteStudentMutation.isPending
            ? t('actions.deleting')
            : t('actions.deleteStudentConfirmAction')
        }
        cancelLabel={t('actions.deleteStudentConfirmCancel')}
        onConfirm={handleConfirmDeleteStudent}
        isPending={deleteStudentMutation.isPending}
      />
    </>
  );
};
