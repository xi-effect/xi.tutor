import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ActionButton } from '@xipkg/actionbutton';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@xipkg/drawer';
import { Add, FileSmall, Group, UserPlus, WhiteBoard } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';
import { ModalAddGroup } from 'features.group.add';
import { InvoiceModal } from 'features.invoice';
import { useCreateMaterial } from 'features.materials.add';
import { useTranslation } from 'react-i18next';
import { ModalInvitation } from './ModalInvitation';

const menuRowClassName = cn(
  'border-border-default bg-background-surface hover:bg-background-page flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
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

export const MobileTutorActionButton = ({
  variant,
  paymentsActiveTab,
  onCreateTemplate,
}: MobileTutorActionButtonProps) => {
  const { t } = useTranslation('invitesModal');
  const { data: user, isLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { createMaterial } = useCreateMaterial();

  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const eventPrefix = variant;
  const isInviteVariant = variant === 'main' || variant === 'classrooms';
  const drawerTitle = t('drawer.title');

  const actions = useMemo(() => {
    const inviteActions: ActionCopy[] = [
      {
        id: 'invite',
        label: t('actions.invite.label'),
        description: t('actions.invite.description'),
        Icon: UserPlus,
        umamiEvent: 'invite-student',
        onboardingId: variant === 'main' ? 'invite-student-button' : undefined,
      },
      {
        id: 'group',
        label: t('actions.group.label'),
        description: t('actions.group.description'),
        Icon: Group,
        umamiEvent: 'create-group',
        onboardingId: variant === 'main' ? 'create-group-button' : undefined,
      },
    ];

    if (variant === 'main' || variant === 'classrooms') {
      return inviteActions;
    }

    if (variant === 'materials') {
      const materialsActions: ActionCopy[] = [
        {
          id: 'board',
          label: t('actions.board.label'),
          description: t('actions.board.description'),
          Icon: WhiteBoard,
          umamiEvent: 'add-board',
        },
        {
          id: 'note',
          label: t('actions.note.label'),
          description: t('actions.note.description'),
          Icon: FileSmall,
          umamiEvent: 'add-note',
        },
      ];
      return materialsActions;
    }

    if (paymentsActiveTab === 'templates') {
      const templateActions: ActionCopy[] = [
        {
          id: 'template',
          label: t('actions.template.label'),
          description: t('actions.template.description'),
          Icon: Add,
          umamiEvent: 'create-template',
        },
      ];
      return templateActions;
    }

    const invoiceActions: ActionCopy[] = [
      {
        id: 'invoice',
        label: t('actions.invoice.label'),
        description: t('actions.invoice.description'),
        Icon: Add,
        umamiEvent: 'create-invoice',
      },
    ];
    return invoiceActions;
  }, [paymentsActiveTab, t, variant]);

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
            <DrawerTitle className="text-m-base text-text-primary font-medium">
              {drawerTitle}
            </DrawerTitle>
            <DrawerDescription className="sr-only">{drawerTitle}</DrawerDescription>

            <div className="dark:bg-background-surface flex flex-col gap-3">
              {actions.map(({ id, label, description, Icon, umamiEvent, onboardingId }) => (
                <button
                  key={id}
                  type="button"
                  id={onboardingId}
                  onClick={() => handleAction(id)}
                  data-umami-event={`${eventPrefix}-${umamiEvent}`}
                  className={menuRowClassName}
                >
                  <Icon className="text-text-primary size-6 shrink-0" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                    <span className="text-m-base text-text-primary font-medium">{label}</span>
                    <span className="text-s-base text-text-secondary">{description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {isInviteVariant && (
        <>
          <ModalInvitation
            open={inviteModalOpen}
            onOpenChange={setInviteModalOpen}
            analyticsSource="main"
          />
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
