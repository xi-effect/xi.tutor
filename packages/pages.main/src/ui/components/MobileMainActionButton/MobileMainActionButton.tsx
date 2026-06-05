import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ActionButton } from '@xipkg/actionbutton';
import { Drawer, DrawerContent } from '@xipkg/drawer';
import { Group, UserPlus } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { ModalAddGroup } from 'features.group.add';
import { ModalInvitation } from 'features.invites';

const menuRowClassName = cn(
  'border-gray-10 bg-gray-0 hover:bg-gray-5 flex h-[48px] w-full items-center gap-3 rounded-xl border px-4 text-left transition-colors',
);

const actionButtonClassName =
  '!fixed !left-1/2 !bottom-[40px] !right-auto !z-50 h-[52px] w-[52px] -translate-x-1/2 rounded-full p-0 max-[960px]:inline-flex min-[961px]:!hidden';

export const MobileMainActionButton = () => {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInvite = () => {
    setDrawerOpen(false);
    setInviteModalOpen(true);
  };

  const handleAddGroup = () => {
    setDrawerOpen(false);
    setAddGroupModalOpen(true);
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <>
      <ActionButton onClick={() => setDrawerOpen(true)} classname={actionButtonClassName} />

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal>
        <DrawerContent className="max-h-screen w-full">
          <div className="dark:bg-gray-0 flex flex-col gap-3">
            <button
              type="button"
              id="invite-student-button"
              onClick={handleInvite}
              data-umami-event="main-invite-student"
              className={menuRowClassName}
            >
              <UserPlus className="size-6 shrink-0 text-gray-100" />
              <span className="text-m-base font-medium text-gray-100">Пригласить ученика</span>
            </button>
            <button
              type="button"
              id="create-group-button"
              onClick={handleAddGroup}
              data-umami-event="main-create-group"
              className={menuRowClassName}
            >
              <Group className="size-6 shrink-0 text-gray-100" />
              <span className="text-m-base font-medium text-gray-100">Создать группу</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <ModalInvitation open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
      <ModalAddGroup open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen} />
    </>,
    document.body,
  );
};
