import { useCallback, useState } from 'react';
import { Tabs } from '@xipkg/tabs';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Add, Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';

import { InformationLayout } from '../Information';
import { ClassroomScheduleProvider } from '../Calendar/ClassroomScheduleContext';
import { CalendarScheduleToolbar } from '../Calendar/ClassroomScheduleParts';
import { AddingLessonModal } from 'features.lesson.add';
import type { FormData as AddingLessonFormData } from 'features.lesson.add';
import { MaterialsAdd } from 'features.materials.add';
import { useGetClassroom, useAddClassroomMaterials, useDeleteClassroom } from 'common.services';
import { switcherTabClass } from 'common.ui';
import { cn } from '@xipkg/utils';
import { useCreateClassroomEvent } from 'modules.calendar';
import { ModalStudentsGroup } from 'features.group.manage';
import { ModalGroupInvite } from 'features.group.invite';
import { InvoiceModal } from 'features.invoice';

import { SharedTabsContent } from './SharedTabsContent';
import { useTabNavigation } from './useTabNavigation';
import { buildCreateClassroomEventRequest } from '../Calendar/schedulerMapping';
import { ClassroomMobileActionButton } from './ClassroomMobileActionButton';
import { ClassroomMobileTabSwitcher } from './ClassroomMobileTabSwitcher';

// --- Типы ---

type ContentKind = 'note' | 'board';
type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

// --- Конфигурация табов ---

const tabs = [
  { id: 'overview', label: 'Сводка' },
  { id: 'materials', label: 'Материалы' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'payments', label: 'Оплаты' },
  { id: 'info', label: 'Информация' },
];

// --- TutorDesktopToolbar ---

interface TutorDesktopToolbarProps {
  currentTab: string;
  classroomKind: string | undefined;
  onAddLessonClick: () => void;
  onOpenInvoiceModal: () => void;
  onDeleteClassroom: () => void;
  isDeletingClassroom: boolean;
}

const TutorDesktopToolbar = ({
  currentTab,
  classroomKind,
  onAddLessonClick,
  onOpenInvoiceModal,
  onDeleteClassroom,
  isDeletingClassroom,
}: TutorDesktopToolbarProps) => {
  if (currentTab === 'overview' && classroomKind === 'group') {
    return (
      <>
        <ModalStudentsGroup>
          <Button
            size="s"
            variant="ghost"
            className="ml-auto rounded-lg"
            data-umami-event="classroom-add-student"
          >
            Добавить ученика
          </Button>
        </ModalStudentsGroup>
        <ModalGroupInvite>
          <Button
            size="s"
            variant="ghost"
            className="ml-1 rounded-lg"
            data-umami-event="classroom-invite-to-group"
          >
            Пригласить в группу
          </Button>
        </ModalGroupInvite>
      </>
    );
  }

  if (currentTab === 'materials') return <MaterialsAdd />;

  if (currentTab === 'schedule') {
    return (
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <CalendarScheduleToolbar />
        <Button
          type="button"
          variant="none"
          className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
          onClick={onAddLessonClick}
          data-umami-event="classroom-add-lesson"
          aria-label="Добавить занятие"
        >
          <Add className="fill-brand-80 size-6" />
        </Button>
      </div>
    );
  }

  if (currentTab === 'payments') {
    return (
      <Button
        size="s"
        className="ml-auto w-8 rounded-lg px-2 py-2 font-medium sm:w-auto sm:px-4"
        onClick={onOpenInvoiceModal}
        data-umami-event="classroom-create-invoice"
      >
        <span className="hidden sm:flex">Создать счёт на оплату</span>
        <Plus size="sm" className="fill-brand-0 flex sm:hidden" />
      </Button>
    );
  }

  if (currentTab === 'info') {
    return (
      <Button
        size="s"
        variant="text"
        className="bg-red-20/50 text-red-60 hover:bg-red-20/80 hover:text-red-60 ml-auto rounded-lg"
        onClick={onDeleteClassroom}
        disabled={isDeletingClassroom}
        data-umami-event="classroom-delete"
      >
        {isDeletingClassroom ? 'Удаление...' : 'Удалить кабинет'}
      </Button>
    );
  }

  return null;
};

// --- TabsTutor ---

export const TabsTutor = () => {
  const { isMobile, currentTab, handleTabChange } = useTabNavigation({
    normalizeMaterialTabs: true,
  });
  const navigate = useNavigate();

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isGroupInviteModalOpen, setIsGroupInviteModalOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addLessonInitialDate, setAddLessonInitialDate] = useState<Date | null>(null);

  const handleAddLessonClick = useCallback((date?: Date) => {
    setAddLessonInitialDate(date ?? null);
    setAddLessonOpen(true);
  }, []);

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom } = useGetClassroom(Number(classroomId));
  const { addClassroomMaterials } = useAddClassroomMaterials();
  const { deleteClassroom, isDeleting: isDeletingClassroom } = useDeleteClassroom();
  const createClassroomEvent = useCreateClassroomEvent();

  const handleDeleteClassroom = () => {
    if (!classroomId) return;
    deleteClassroom(
      { classroomId: Number(classroomId) },
      { onSuccess: () => navigate({ to: '/classrooms' }) },
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

  const handleAddLessonSubmit = async (data: AddingLessonFormData) => {
    await createClassroomEvent.mutateAsync({
      classroomId: Number(classroomId),
      body: buildCreateClassroomEventRequest(data),
      analytics: {
        source: 'classroom',
        lesson_type:
          classroom?.kind === 'group'
            ? 'group'
            : classroom?.kind === 'individual'
              ? 'individual'
              : 'unknown',
        is_recurring: data.repeatMode !== 'none',
        has_description: Boolean(data.description?.trim()),
      },
    });
  };

  return (
    <ClassroomScheduleProvider onAddLessonClick={handleAddLessonClick}>
      <div className="flex h-[calc(100vh-80px)] min-h-0 min-w-0 flex-col">
        <Tabs.Root
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 pt-2"
          value={currentTab}
          onValueChange={handleTabChange}
        >
          <div className="bg-gray-0 xs:ml-0 mr-4 ml-4 flex h-[56px] flex-row items-center gap-4 rounded-2xl px-2">
            {isMobile ? (
              <ClassroomMobileTabSwitcher
                tabs={tabs}
                activeTab={currentTab}
                onChange={handleTabChange}
              />
            ) : (
              <>
                <SwitcherAnimate
                  tabs={tabs}
                  activeTab={currentTab}
                  onChange={handleTabChange}
                  className="bg-gray-0 flex flex-row gap-0"
                  tabClassName={cn(switcherTabClass, 'text-m-base font-medium')}
                />
                <TutorDesktopToolbar
                  currentTab={currentTab}
                  classroomKind={classroom?.kind}
                  onAddLessonClick={() => handleAddLessonClick()}
                  onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
                  onDeleteClassroom={handleDeleteClassroom}
                  isDeletingClassroom={isDeletingClassroom}
                />
              </>
            )}
          </div>

          <div className="bg-gray-0 xs:pb-0 xs:rounded-tl-2xl flex min-h-0 min-w-0 flex-1 flex-col rounded-none pt-0 pb-40 pl-4">
            <SharedTabsContent
              extraContent={
                <Tabs.Content className="data-[state=inactive]:hidden" value="info">
                  <InformationLayout />
                </Tabs.Content>
              }
            />
          </div>

          <AddingLessonModal
            open={addLessonOpen}
            onOpenChange={setAddLessonOpen}
            initialDate={addLessonInitialDate}
            fixedClassroomId={Number(classroomId)}
            onSubmit={handleAddLessonSubmit}
            analyticsSource="classroom"
          />

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
              onDeleteClassroom={handleDeleteClassroom}
              onStudentsModalChange={setIsStudentsModalOpen}
              onGroupInviteModalChange={setIsGroupInviteModalOpen}
            />
          )}
        </Tabs.Root>
      </div>
    </ClassroomScheduleProvider>
  );
};
