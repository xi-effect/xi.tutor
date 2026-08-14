import { useMemo, useState } from 'react';
import { Tabs } from '@xipkg/tabs';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';

import { InformationLayout } from '../Information';
import { CalendarScheduleToolbar } from '../Calendar/ClassroomScheduleParts';
import { MaterialsAdd } from 'features.materials.add';
import { useGetClassroom, useAddClassroomMaterials, useDeleteClassroom } from 'common.services';
import { ConfirmDialog } from 'common.ui';
import { cn } from '@xipkg/utils';
import { ModalStudentsGroup } from 'features.group.manage';
import { ModalGroupInvite } from 'features.group.invite';
import { InvoiceModal } from 'features.invoice';
import { useTranslation } from 'react-i18next';

import { SharedTabsContent } from './SharedTabsContent';
import { useTabNavigation } from './useTabNavigation';
import { ClassroomMobileActionButton } from './ClassroomMobileActionButton';
import { ClassroomTabsBar } from './ClassroomTabsBar';
import { useClassroomScheduleOptional } from '../Calendar/useClassroomSchedule';

type ContentKind = 'note' | 'board';
type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

const primaryActionClass = '!h-8 gap-2 rounded-[10px] px-4 font-medium text-text-on-accent';
const ghostActionClass = '!h-auto rounded-[10px] px-5 py-3 text-base leading-5 font-medium';

interface TutorDesktopToolbarProps {
  currentTab: string;
  classroomKind: string | undefined;
  materialKind: 'note' | 'board';
  onAddLessonClick: () => void;
  onOpenInvoiceModal: () => void;
  onDeleteClassroom: () => void;
  isDeletingClassroom: boolean;
}

const TutorDesktopToolbar = ({
  currentTab,
  classroomKind,
  materialKind,
  onAddLessonClick,
  onOpenInvoiceModal,
  onDeleteClassroom,
  isDeletingClassroom,
}: TutorDesktopToolbarProps) => {
  const { t } = useTranslation('classroom');

  if (currentTab === 'overview' && classroomKind === 'group') {
    return (
      <div className="ml-auto hidden shrink-0 items-center gap-2 sm:flex">
        <ModalStudentsGroup>
          <Button
            variant="ghost"
            className={ghostActionClass}
            data-umami-event="classroom-add-student"
          >
            {t('actions.addStudent')}
          </Button>
        </ModalStudentsGroup>
        <ModalGroupInvite>
          <Button
            variant="ghost"
            className={ghostActionClass}
            data-umami-event="classroom-invite-to-group"
          >
            {t('actions.inviteToGroup')}
          </Button>
        </ModalGroupInvite>
      </div>
    );
  }

  if (currentTab === 'materials') {
    return (
      <div className="ml-auto hidden shrink-0 items-center gap-2 sm:flex">
        <MaterialsAdd kind={materialKind} />
      </div>
    );
  }

  if (currentTab === 'schedule') {
    return (
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <CalendarScheduleToolbar />
        <Button
          type="button"
          variant="primary"
          className="text-text-on-accent hidden !size-8 shrink-0 rounded-[10px] p-0 sm:inline-flex"
          onClick={onAddLessonClick}
          aria-label={t('actions.addLesson')}
          data-umami-event="classroom-add-lesson"
        >
          <Plus className="fill-text-on-accent size-4 shrink-0" />
        </Button>
      </div>
    );
  }

  if (currentTab === 'payments') {
    return (
      <Button
        variant="primary"
        className={cn(primaryActionClass, 'ml-auto hidden sm:inline-flex')}
        onClick={onOpenInvoiceModal}
        data-umami-event="classroom-create-invoice"
      >
        <Plus className="fill-text-on-accent size-4 shrink-0" />
        {t('actions.createInvoice')}
      </Button>
    );
  }

  if (currentTab === 'info') {
    return (
      <Button
        variant="ghost"
        className="bg-status-error-background/50 text-text-danger hover:bg-status-error-background/80 hover:text-text-danger ml-auto hidden !h-8 rounded-[10px] px-4 font-medium sm:inline-flex"
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
  const { isMobile, currentTab, handleTabChange } = useTabNavigation({
    normalizeMaterialTabs: true,
  });
  const navigate = useNavigate();

  const tabs = useMemo(
    () => [
      { id: 'overview', label: t('tabs.overview') },
      { id: 'materials', label: t('tabs.materials') },
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

  const { onAddLessonClick } = useClassroomScheduleOptional() ?? {};

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const materialKind = search.tab === 'notes' ? 'note' : 'board';
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
                classroomKind={classroom?.kind}
                materialKind={materialKind}
                onAddLessonClick={() => onAddLessonClick?.()}
                onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
                onDeleteClassroom={handleDeleteClassroomClick}
                isDeletingClassroom={isDeletingClassroom}
              />
            )
          }
        />

        <div
          className={cn(
            'xs:min-h-0 mt-4 flex min-h-[calc(100dvh-272px)] min-w-0 flex-1 flex-col overflow-hidden pl-5 sm:mt-6 sm:pl-8 md:pl-10',
            currentTab === 'overview' || currentTab === 'payments' || currentTab === 'materials'
              ? 'pr-0 pb-0'
              : 'pr-5 pb-5 sm:pr-8 sm:pb-8 md:pr-10',
          )}
        >
          <SharedTabsContent
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
