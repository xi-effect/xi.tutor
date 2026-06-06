import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ActionButton } from '@xipkg/actionbutton';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@xipkg/drawer';
import { Add, FileSmall, Group, UserPlus, WhiteBoard } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';
import { ModalAddGroup } from 'features.group.add';
import { InvoiceModal } from 'features.invoice';
import { useCreateMaterial } from 'features.materials.add';
import { ModalInvitation } from './ModalInvitation';

const DRAWER_TITLE = 'Выберите действие';

const menuRowClassName = cn(
  'border-gray-10 bg-gray-0 hover:bg-gray-5 flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
);

export type MobileTutorActionButtonVariant = 'main' | 'classrooms' | 'materials' | 'payments';

type ActionId = 'invite' | 'group' | 'board' | 'note' | 'invoice' | 'template';

type ActionCopy = {
  id: ActionId;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  umamiEvent: string;
  onboardingId?: string;
};

type MobileTutorActionButtonProps = {
  variant: MobileTutorActionButtonVariant;
  paymentsActiveTab?: string;
  onCreateTemplate?: () => void;
};

const variantMeta: Record<MobileTutorActionButtonVariant, { actions: ActionCopy[] }> = {
  main: {
    actions: [
      {
        id: 'invite',
        label: 'Пригласить ученика',
        description: 'Отправьте персональную ссылку-приглашение',
        Icon: UserPlus,
        umamiEvent: 'invite-student',
        onboardingId: 'invite-student-button',
      },
      {
        id: 'group',
        label: 'Создать группу',
        description: 'Создайте учебную группу и пригласите учеников',
        Icon: Group,
        umamiEvent: 'create-group',
        onboardingId: 'create-group-button',
      },
    ],
  },
  classrooms: {
    actions: [
      {
        id: 'invite',
        label: 'Пригласить ученика',
        description: 'Отправьте персональную ссылку-приглашение',
        Icon: UserPlus,
        umamiEvent: 'invite-student',
      },
      {
        id: 'group',
        label: 'Создать группу',
        description: 'Создайте учебную группу и пригласите учеников',
        Icon: Group,
        umamiEvent: 'create-group',
      },
    ],
  },
  materials: {
    actions: [
      {
        id: 'board',
        label: 'Интерактивная доска',
        description: 'Создайте доску для совместных занятий',
        Icon: WhiteBoard,
        umamiEvent: 'add-board',
      },
      {
        id: 'note',
        label: 'Заметка',
        description: 'Создайте заметку с текстом и материалами',
        Icon: FileSmall,
        umamiEvent: 'add-note',
      },
    ],
  },
  payments: {
    actions: [],
  },
};

const paymentsInvoiceAction: ActionCopy = {
  id: 'invoice',
  label: 'Счёт на оплату',
  description: 'Выставьте счёт ученику за проведённое занятие',
  Icon: Add,
  umamiEvent: 'create-invoice',
};

const paymentsTemplateAction: ActionCopy = {
  id: 'template',
  label: 'Тип оплаты',
  description: 'Создайте шаблон для быстрого выставления счетов',
  Icon: Add,
  umamiEvent: 'create-template',
};

const getPaymentsActions = (activeTab?: string): ActionCopy[] => {
  if (activeTab === 'templates') {
    return [paymentsTemplateAction];
  }

  return [paymentsInvoiceAction];
};

export const MobileTutorActionButton = ({
  variant,
  paymentsActiveTab,
  onCreateTemplate,
}: MobileTutorActionButtonProps) => {
  const { data: user, isLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { createMaterial } = useCreateMaterial();

  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const eventPrefix = variant;
  const meta =
    variant === 'payments'
      ? { actions: getPaymentsActions(paymentsActiveTab) }
      : variantMeta[variant];
  const isInviteVariant = variant === 'main' || variant === 'classrooms';

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  const handleAction = (actionId: ActionId) => {
    closeDrawer();

    switch (actionId) {
      case 'invite':
        setInviteModalOpen(true);
        break;
      case 'group':
        setAddGroupModalOpen(true);
        break;
      case 'note':
        createMaterial('note');
        break;
      case 'board':
        createMaterial('board');
        break;
      case 'invoice':
        setInvoiceModalOpen(true);
        break;
      case 'template':
        onCreateTemplate?.();
        break;
    }
  };

  if (!mounted || isLoading || !isTutor) {
    return null;
  }

  return createPortal(
    <>
      <div className="pointer-events-none fixed bottom-[36px] left-1/2 z-40 hidden -translate-x-1/2 max-[960px]:block">
        <ActionButton
          onClick={() => setDrawerOpen(true)}
          classname="pointer-events-auto !relative !right-auto !bottom-auto h-[52px] w-[52px] !rounded-full p-0 shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
        />
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal>
        <DrawerContent className="max-h-screen w-full">
          <div className="flex flex-col gap-4 pb-8">
            <DrawerTitle className="text-m-base font-medium text-gray-100">
              {DRAWER_TITLE}
            </DrawerTitle>
            <DrawerDescription className="sr-only">{DRAWER_TITLE}</DrawerDescription>

            <div className="dark:bg-gray-0 flex flex-col gap-3">
              {meta.actions.map(({ id, label, description, Icon, umamiEvent, onboardingId }) => (
                <button
                  key={id}
                  type="button"
                  id={onboardingId}
                  onClick={() => handleAction(id)}
                  data-umami-event={`${eventPrefix}-${umamiEvent}`}
                  className={menuRowClassName}
                >
                  <Icon className="size-6 shrink-0 text-gray-100" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                    <span className="text-m-base font-medium text-gray-100">{label}</span>
                    <span className="text-s-base text-gray-60">{description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {isInviteVariant && (
        <>
          <ModalInvitation open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
          <ModalAddGroup open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen} />
        </>
      )}

      {variant === 'payments' && (
        <InvoiceModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} />
      )}
    </>,
    document.body,
  );
};
