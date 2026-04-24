import { useCallback, useState } from 'react';
import { Tabs } from '@xipkg/tabs';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Add, Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { ActionButton } from '@xipkg/actionbutton';

import { InformationLayout } from '../Information';
import { ClassroomScheduleProvider } from '../Calendar/ClassroomScheduleContext';
import { CalendarScheduleToolbar } from '../Calendar/ClassroomScheduleParts';
import { AddingLessonModal } from 'features.lesson.add';
import { MaterialsAdd } from 'features.materials.add';
import { useGetClassroom, useAddClassroomMaterials, useDeleteClassroom } from 'common.services';
import { ModalStudentsGroup } from 'features.group.manage';
import { ModalGroupInvite } from 'features.group.invite';
import { InvoiceModal } from 'features.invoice';

import { SharedTabsContent } from './SharedTabsContent';
import { useTabNavigation } from './useTabNavigation';

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

// --- TutorMobileActions ---

interface TutorMobileActionsProps {
  currentTab: string;
  classroomKind: string | undefined;
  isPendingAddMaterial: boolean;
  isDeletingClassroom: boolean;
  isStudentsModalOpen: boolean;
  isGroupInviteModalOpen: boolean;
  onAddMaterial: (contentKind: ContentKind, studentAccessMode: StudentAccessMode) => void;
  onOpenInvoiceModal: () => void;
  onDeleteClassroom: () => void;
  onStudentsModalChange: (open: boolean) => void;
  onGroupInviteModalChange: (open: boolean) => void;
}

const TutorMobileActions = ({
  currentTab,
  classroomKind,
  isPendingAddMaterial,
  isDeletingClassroom,
  isStudentsModalOpen,
  isGroupInviteModalOpen,
  onAddMaterial,
  onOpenInvoiceModal,
  onDeleteClassroom,
  onStudentsModalChange,
  onGroupInviteModalChange,
}: TutorMobileActionsProps) => (
  <>
    <ActionButton
      classname="fixed bottom-5 right-4 z-50 h-[64px] w-[64px] rounded-2xl"
      dropdownContentProps={{ className: 'w-auto py-2' }}
    >
      {({ MenuItem }) => (
        <>
          {currentTab === 'overview' && classroomKind === 'group' && (
            <>
              <MenuItem
                className="h-[48px] rounded-xl px-4 text-[22px]"
                data-umami-event="classroom-add-student"
                onClick={() => onStudentsModalChange(true)}
              >
                Добавить ученика
              </MenuItem>
              <MenuItem
                className="h-[48px] rounded-xl px-4 text-[22px]"
                data-umami-event="classroom-invite-to-group"
                onClick={() => onGroupInviteModalChange(true)}
              >
                Пригласить в группу
              </MenuItem>
            </>
          )}
          {currentTab === 'materials' && (
            <>
              <MenuItem
                className="h-[48px] rounded-xl px-4 text-[22px]"
                onClick={() => onAddMaterial('note', 'read_write')}
                disabled={isPendingAddMaterial}
                data-umami-event="material-create-note"
                data-umami-event-access-mode="read_write"
              >
                Заметка: Совместная работа
              </MenuItem>
              <MenuItem
                className="h-[48px] rounded-xl px-4 text-[22px]"
                onClick={() => onAddMaterial('note', 'read_only')}
                disabled={isPendingAddMaterial}
                data-umami-event="material-create-note"
                data-umami-event-access-mode="read_only"
              >
                Заметка: Только репетитор
              </MenuItem>
              <MenuItem
                className="h-[48px] rounded-xl px-4 text-[22px]"
                onClick={() => onAddMaterial('note', 'no_access')}
                disabled={isPendingAddMaterial}
                data-umami-event="material-create-note"
                data-umami-event-access-mode="no_access"
              >
                Заметка: Черновики
              </MenuItem>
              <MenuItem
                className="h-[48px] rounded-xl px-4 text-[22px]"
                onClick={() => onAddMaterial('board', 'read_write')}
                disabled={isPendingAddMaterial}
                data-umami-event="material-create-board"
                data-umami-event-access-mode="read_write"
              >
                Доска: Совместная работа
              </MenuItem>
              <MenuItem
                className="h-[48px] rounded-xl px-4 text-[22px]"
                onClick={() => onAddMaterial('board', 'read_only')}
                disabled={isPendingAddMaterial}
                data-umami-event="material-create-board"
                data-umami-event-access-mode="read_only"
              >
                Доска: Только репетитор
              </MenuItem>
              <MenuItem
                className="h-[48px] rounded-xl px-4 text-[22px]"
                onClick={() => onAddMaterial('board', 'no_access')}
                disabled={isPendingAddMaterial}
                data-umami-event="material-create-board"
                data-umami-event-access-mode="no_access"
              >
                Доска: Черновики
              </MenuItem>
            </>
          )}
          {currentTab === 'payments' && (
            <MenuItem
              className="h-[48px] w-full rounded-xl px-4 text-[22px]"
              onClick={onOpenInvoiceModal}
              data-umami-event="classroom-create-invoice"
            >
              Создать счёт на оплату
            </MenuItem>
          )}
          {currentTab === 'info' && (
            <MenuItem
              className="text-red-60 h-[48px] w-full rounded-xl px-4 text-[22px]"
              onClick={onDeleteClassroom}
              disabled={isDeletingClassroom}
              data-umami-event="classroom-delete"
            >
              {isDeletingClassroom ? 'Удаление...' : 'Удалить кабинет'}
            </MenuItem>
          )}
        </>
      )}
    </ActionButton>
    <ModalStudentsGroup open={isStudentsModalOpen} onOpenChange={onStudentsModalChange} />
    <ModalGroupInvite open={isGroupInviteModalOpen} onOpenChange={onGroupInviteModalChange} />
  </>
);

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

  return (
    <ClassroomScheduleProvider onAddLessonClick={handleAddLessonClick}>
      <div className="flex h-[calc(100vh-80px)] min-h-0 min-w-0 flex-col">
        <Tabs.Root
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 pt-2"
          value={currentTab}
          onValueChange={handleTabChange}
        >
          <div className="bg-gray-0 mr-4 flex h-[56px] flex-row items-center gap-4 overflow-x-auto rounded-2xl px-2">
            <SwitcherAnimate
              tabs={tabs}
              activeTab={currentTab}
              onChange={handleTabChange}
              className="bg-gray-0 flex flex-row gap-0 max-sm:w-full"
              tabClassName="text-m-base font-medium text-gray-100 hover:bg-gray-5"
            />
            {!isMobile && (
              <TutorDesktopToolbar
                currentTab={currentTab}
                classroomKind={classroom?.kind}
                onAddLessonClick={() => handleAddLessonClick()}
                onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
                onDeleteClassroom={handleDeleteClassroom}
                isDeletingClassroom={isDeletingClassroom}
              />
            )}
          </div>

          <div className="bg-gray-0 flex min-h-0 min-w-0 flex-1 flex-col rounded-tl-2xl pt-0 pl-4">
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
            dayLessons={[]}
            initialDate={addLessonInitialDate}
          />

          {isInvoiceModalOpen && (
            <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
          )}

          {isMobile && (
            <TutorMobileActions
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
