import { useMemo, useState } from 'react';
import { Tabs } from '@xipkg/tabs';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@xipkg/button';

import { InformationLayout } from '../Information';
import { useGetClassroom, useAddClassroomMaterials, useDeleteClassroom } from 'common.services';
import { ConfirmDialog } from 'common.ui';
import { cn } from '@xipkg/utils';
import { InvoiceModal } from 'features.invoice';
import { useTranslation } from 'react-i18next';

import { SharedTabsContent } from './SharedTabsContent';
import { isClassroomMaterialTab, useTabNavigation } from './useTabNavigation';
import { ClassroomMobileActionButton } from './ClassroomMobileActionButton';
import { ClassroomTabsBar } from './ClassroomTabsBar';
import { NextLessonChip } from '../Header/NextLessonChip';

type ContentKind = 'note' | 'board';
type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

const NEXT_LESSON_TABS = new Set(['boards', 'notes', 'files', 'schedule', 'payments']);

interface TutorDesktopToolbarProps {
  currentTab: string;
  onDeleteClassroom: () => void;
  isDeletingClassroom: boolean;
}

const TutorDesktopToolbar = ({
  currentTab,
  onDeleteClassroom,
  isDeletingClassroom,
}: TutorDesktopToolbarProps) => {
  const { t } = useTranslation('classroom');

  if (NEXT_LESSON_TABS.has(currentTab)) {
    return <NextLessonChip />;
  }

  if (currentTab === 'info') {
    return (
      <Button
        variant="ghost"
        className="bg-status-error-background/50 text-text-danger hover:bg-status-error-background/80 hover:text-text-danger hidden h-8! rounded-[10px] px-4 font-medium sm:inline-flex"
        onClick={onDeleteClassroom}
        disabled={isDeletingClassroom}
        data-umami-event="classroom-delete"
      >
        {isDeletingClassroom ? t('actions.deleting') : t('actions.deleteClassroom')}
      </Button>
    );
  }

  return null;
};

export const TabsTutor = () => {
  const { t } = useTranslation('classroom');
  const { isMobile, currentTab, handleTabChange } = useTabNavigation();
  const navigate = useNavigate();

  const tabs = useMemo(
    () => [
      { id: 'boards', label: t('materials.boards') },
      { id: 'notes', label: t('materials.notes') },
      { id: 'files', label: t('materials.files') },
      { id: 'schedule', label: t('tabs.schedule') },
      { id: 'payments', label: t('tabs.payments') },
      { id: 'info', label: t('tabs.info') },
    ],
    [t],
  );

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isGroupInviteModalOpen, setIsGroupInviteModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom } = useGetClassroom(Number(classroomId));
  const { addClassroomMaterials } = useAddClassroomMaterials();
  const { deleteClassroom, isDeleting: isDeletingClassroom } = useDeleteClassroom();

  const handleDeleteClassroomClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteClassroom = () => {
    if (!classroomId) return;
    deleteClassroom(
      { classroomId: Number(classroomId) },
      {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          navigate({ to: '/classrooms' });
        },
      },
    );
  };

  const handleAddMaterial = (contentKind: ContentKind, studentAccessMode: StudentAccessMode) => {
    if (!classroomId) return;
    addClassroomMaterials.mutate(
      { classroomId, content_kind: contentKind, student_access_mode: studentAccessMode },
      {
        onSuccess: (response) => {
          if (contentKind === 'note') {
            navigate({
              to: '/classrooms/$classroomId/notes/$noteId',
              params: { classroomId, noteId: response.data.id },
            });
          } else {
            navigate({
              to: '/classrooms/$classroomId/boards/$boardId',
              params: { classroomId, boardId: response.data.id },
            });
          }
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs.Root
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        value={currentTab}
        onValueChange={handleTabChange}
      >
        <ClassroomTabsBar
          tabs={tabs}
          currentTab={currentTab}
          onChange={handleTabChange}
          isMobile={isMobile}
          extra={
            isMobile ? undefined : (
              <TutorDesktopToolbar
                currentTab={currentTab}
                onDeleteClassroom={handleDeleteClassroomClick}
                isDeletingClassroom={isDeletingClassroom}
              />
            )
          }
        />

        <div
          className={cn(
            'xs:min-h-0 mt-4 flex min-h-[calc(100dvh-272px)] min-w-0 flex-1 flex-col overflow-hidden pl-5 sm:mt-6 sm:pl-8 md:pl-10',
            currentTab === 'payments' || isClassroomMaterialTab(currentTab)
              ? 'pr-0 pb-0'
              : 'pr-5 pb-5 sm:pr-8 sm:pb-8 md:pr-10',
          )}
        >
          <SharedTabsContent
            currentTab={currentTab}
            onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
            extraContent={
              <Tabs.Content
                className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain data-[state=inactive]:hidden"
                value="info"
              >
                <InformationLayout />
              </Tabs.Content>
            }
          />
        </div>

        {isInvoiceModalOpen && (
          <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
        )}

        {isMobile && (
          <ClassroomMobileActionButton
            currentTab={currentTab}
            classroomKind={classroom?.kind}
            isPendingAddMaterial={addClassroomMaterials.isPending}
            isDeletingClassroom={isDeletingClassroom}
            isStudentsModalOpen={isStudentsModalOpen}
            isGroupInviteModalOpen={isGroupInviteModalOpen}
            onAddMaterial={handleAddMaterial}
            onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
            onDeleteClassroom={handleDeleteClassroomClick}
            onStudentsModalChange={setIsStudentsModalOpen}
            onGroupInviteModalChange={setIsGroupInviteModalOpen}
          />
        )}
      </Tabs.Root>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('actions.deleteClassroomConfirmTitle')}
        description={t('actions.deleteClassroomConfirmDescription', {
          name: classroom?.name ?? '',
        })}
        confirmLabel={
          isDeletingClassroom ? t('actions.deleting') : t('actions.deleteClassroomConfirmAction')
        }
        cancelLabel={t('actions.deleteClassroomConfirmCancel')}
        onConfirm={handleConfirmDeleteClassroom}
        isPending={isDeletingClassroom}
      />
    </div>
  );
};
