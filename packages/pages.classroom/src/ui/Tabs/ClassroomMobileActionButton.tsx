import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ActionButton } from '@xipkg/actionbutton';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@xipkg/drawer';
import { Add, FileSmall, Group, Trash, UserPlus, WhiteBoard } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { ModalStudentsGroup } from 'features.group.manage';
import { ModalGroupInvite } from 'features.group.invite';

const DRAWER_TITLE = 'Выберите действие';

const menuRowClassName = cn(
  'border-border-default bg-background-surface hover:bg-background-page flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
);

type ContentKind = 'note' | 'board';
type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

type DrawerAction = {
  id: string;
  label: string;
  description?: string;
  Icon: React.ComponentType<{ className?: string }>;
  umamiEvent?: string;
  umamiAccessMode?: StudentAccessMode;
  disabled?: boolean;
  destructive?: boolean;
  onClick: () => void;
};

type ClassroomMobileActionButtonProps = {
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
};

const materialActionsConfig: {
  contentKind: ContentKind;
  accessMode: StudentAccessMode;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  umamiEvent: string;
}[] = [
  {
    contentKind: 'note',
    accessMode: 'read_write',
    label: 'Заметка: Совместная работа',
    Icon: FileSmall,
    umamiEvent: 'material-create-note',
  },
  {
    contentKind: 'note',
    accessMode: 'read_only',
    label: 'Заметка: Только репетитор',
    Icon: FileSmall,
    umamiEvent: 'material-create-note',
  },
  {
    contentKind: 'note',
    accessMode: 'no_access',
    label: 'Заметка: Черновики',
    Icon: FileSmall,
    umamiEvent: 'material-create-note',
  },
  {
    contentKind: 'board',
    accessMode: 'read_write',
    label: 'Доска: Совместная работа',
    Icon: WhiteBoard,
    umamiEvent: 'material-create-board',
  },
  {
    contentKind: 'board',
    accessMode: 'read_only',
    label: 'Доска: Только репетитор',
    Icon: WhiteBoard,
    umamiEvent: 'material-create-board',
  },
  {
    contentKind: 'board',
    accessMode: 'no_access',
    label: 'Доска: Черновики',
    Icon: WhiteBoard,
    umamiEvent: 'material-create-board',
  },
];

export const ClassroomMobileActionButton = ({
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
}: ClassroomMobileActionButtonProps) => {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  const actions = useMemo((): DrawerAction[] => {
    if (currentTab === 'overview' && classroomKind === 'group') {
      return [
        {
          id: 'add-student',
          label: 'Добавить ученика',
          description: 'Добавьте ученика в учебную группу',
          Icon: UserPlus,
          umamiEvent: 'classroom-add-student',
          onClick: () => {
            closeDrawer();
            onStudentsModalChange(true);
          },
        },
        {
          id: 'invite-to-group',
          label: 'Пригласить в группу',
          description: 'Отправьте ссылку-приглашение в группу',
          Icon: Group,
          umamiEvent: 'classroom-invite-to-group',
          onClick: () => {
            closeDrawer();
            onGroupInviteModalChange(true);
          },
        },
      ];
    }

    if (currentTab === 'materials') {
      return materialActionsConfig.map(({ contentKind, accessMode, label, Icon, umamiEvent }) => ({
        id: `${contentKind}-${accessMode}`,
        label,
        Icon,
        umamiEvent,
        umamiAccessMode: accessMode,
        disabled: isPendingAddMaterial,
        onClick: () => {
          closeDrawer();
          onAddMaterial(contentKind, accessMode);
        },
      }));
    }

    if (currentTab === 'payments') {
      return [
        {
          id: 'create-invoice',
          label: 'Создать счёт на оплату',
          description: 'Выставьте счёт ученику за проведённое занятие',
          Icon: Add,
          umamiEvent: 'classroom-create-invoice',
          onClick: () => {
            closeDrawer();
            onOpenInvoiceModal();
          },
        },
      ];
    }

    if (currentTab === 'info') {
      return [
        {
          id: 'delete-classroom',
          label: isDeletingClassroom ? 'Удаление...' : 'Удалить кабинет',
          description: 'Кабинет и все связанные данные будут удалены',
          Icon: Trash,
          umamiEvent: 'classroom-delete',
          disabled: isDeletingClassroom,
          destructive: true,
          onClick: () => {
            closeDrawer();
            onDeleteClassroom();
          },
        },
      ];
    }

    return [];
  }, [
    classroomKind,
    currentTab,
    isDeletingClassroom,
    isPendingAddMaterial,
    onAddMaterial,
    onDeleteClassroom,
    onGroupInviteModalChange,
    onOpenInvoiceModal,
    onStudentsModalChange,
  ]);

  const isGroupClassroom = classroomKind === 'group';
  const groupModals =
    isGroupClassroom && (isStudentsModalOpen || isGroupInviteModalOpen) ? (
      <>
        {isStudentsModalOpen && (
          <ModalStudentsGroup open={isStudentsModalOpen} onOpenChange={onStudentsModalChange} />
        )}
        {isGroupInviteModalOpen && (
          <ModalGroupInvite open={isGroupInviteModalOpen} onOpenChange={onGroupInviteModalChange} />
        )}
      </>
    ) : null;

  if (!mounted || actions.length === 0) {
    return groupModals;
  }

  return createPortal(
    <>
      <div className="pointer-events-none fixed bottom-[36px] left-1/2 z-40 -translate-x-1/2">
        <ActionButton
          onClick={() => setDrawerOpen(true)}
          classname="pointer-events-auto !relative !right-auto !bottom-auto h-[52px] w-[52px] !rounded-full p-0 shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
        />
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal>
        <DrawerContent className="max-h-screen w-full">
          <div className="flex flex-col gap-4 pb-8">
            <DrawerTitle className="text-m-base text-text-primary font-medium">
              {DRAWER_TITLE}
            </DrawerTitle>
            <DrawerDescription className="sr-only">{DRAWER_TITLE}</DrawerDescription>

            <div className="dark:bg-background-surface flex flex-col gap-3">
              {actions.map(
                ({
                  id,
                  label,
                  description,
                  Icon,
                  umamiEvent,
                  umamiAccessMode,
                  disabled,
                  destructive,
                  onClick,
                }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={onClick}
                    disabled={disabled}
                    data-umami-event={umamiEvent}
                    data-umami-event-access-mode={umamiAccessMode}
                    className={cn(
                      menuRowClassName,
                      destructive && 'border-border-error hover:bg-status-error-background/30',
                      disabled && 'pointer-events-none opacity-50',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-6 shrink-0',
                        destructive ? 'text-text-danger' : 'text-text-primary',
                      )}
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                      <span
                        className={cn(
                          'text-m-base font-medium',
                          destructive ? 'text-text-danger' : 'text-text-primary',
                        )}
                      >
                        {label}
                      </span>
                      {description && (
                        <span className="text-s-base text-text-secondary">{description}</span>
                      )}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {groupModals}
    </>,
    document.body,
  );
};
