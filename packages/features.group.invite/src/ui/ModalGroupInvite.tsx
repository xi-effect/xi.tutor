import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalTrigger,
  ModalCloseButton,
  ModalDescription,
  ModalFooter,
} from '@xipkg/modal';

import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@xipkg/dropdown';

import { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { env } from 'common.env';
import { Input } from '@xipkg/input';
import { MoreVert } from '@xipkg/icons';
import { useGroupInvite } from '../services/useGroupInvite';
import { useGetClassroom } from 'common.services';
import { useResetGroupInvite } from '../services/useResetGroupInvite';

type ModalGroupInviteProps = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ModalGroupInvite = ({
  children,
  open: controlledOpen,
  onOpenChange,
}: ModalGroupInviteProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (value: boolean) => onOpenChange?.(value) : setInternalOpen;

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data, isLoading } = useGroupInvite({
    classroomId: classroomId,
    disabled: !open,
  });
  const { data: classroom } = useGetClassroom(Number(classroomId));
  const { mutate: resetInvite, isPending: isResettingInvite } = useResetGroupInvite({
    classroom_id: classroomId,
  });

  const inviteLink = data?.code ? `${env.VITE_APP_DOMAIN}/invite/${data.code}` : '';

  const handleCopyLink = () => {
    if (!inviteLink) return;

    navigator.clipboard.writeText(inviteLink);
    toast.success('Ссылка скопирована');
    toast.info('Отправьте ссылку ученикам');
  };

  const handleResetInvite = () => {
    resetInvite(
      { source: 'classroom' },
      {
        onSuccess: () => {
          toast.success('Ссылка сброшена');
        },
      },
    );
  };

  const cleanupBodyScrollLock = () => {
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    document.body.removeAttribute('data-scroll-locked');
  };

  const handleClose = () => {
    setOpen(false);
    cleanupBodyScrollLock();
  };

  useEffect(() => {
    if (open === false) cleanupBodyScrollLock();
    return cleanupBodyScrollLock;
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (typeof next === 'boolean') setOpen(next);
        if (next === false) cleanupBodyScrollLock();
      }}
    >
      {children && <ModalTrigger asChild>{children}</ModalTrigger>}
      <ModalContent className="max-w-[600px]">
        <ModalHeader>
          <ModalCloseButton onClick={handleClose} />
          <ModalTitle className="text-text-primary max-w-[calc(100%-48px)]">
            Приглашение в группу
          </ModalTitle>
          <ModalDescription>
            Отправьте ссылку ученикам, чтобы пригласить их в группу
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="flex w-full flex-col gap-2 p-6">
          <div className="flex w-full flex-row items-center justify-center gap-2">
            <div className="flex w-full items-center justify-center">
              {isLoading || isResettingInvite ? (
                <div
                  className="text-text-link inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent"
                  role="status"
                  aria-label="loading"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <div className="w-full">
                  <Input
                    className="w-full cursor-pointer"
                    type="text"
                    placeholder="Ссылка"
                    value={inviteLink}
                    onClick={handleCopyLink}
                    readOnly
                    data-umami-event="group-invite-copy-link-input"
                  />
                </div>
              )}
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-12 w-12"
                    variant="none"
                    size="icon"
                    data-umami-event="group-invite-menu-open"
                  >
                    <MoreVert className="fill-icon-primary h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className="border-border-default bg-background-surface border p-1"
                >
                  <DropdownMenuItem
                    onClick={handleResetInvite}
                    data-umami-event="group-invite-reset"
                  >
                    Сбросить ссылку
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    Деактивировать ссылку
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {classroom &&
            classroom.kind === 'group' &&
            classroom?.enrollments_count !== undefined &&
            !isLoading && (
              <div className="text-xs-base text-status-success-text flex flex-col gap-2">
                Cтудентов в кабинете: {classroom?.enrollments_count} из 15
              </div>
            )}
        </ModalBody>
        <ModalFooter className="flex gap-2">
          <Button
            onClick={handleCopyLink}
            disabled={!inviteLink}
            data-umami-event="group-invite-copy-link-button"
          >
            Копировать ссылку
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
