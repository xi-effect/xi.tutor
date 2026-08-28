import {
  Modal,
  ModalTitle,
  ModalContent,
  ModalBody,
  ModalTrigger,
  ModalDescription,
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
import { MoreVert, Updates } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { useGroupInvite } from '../services/useGroupInvite';
import { useGetClassroom } from 'common.services';
import { useResetGroupInvite } from '../services/useResetGroupInvite';
import {
  ModalCloseIcon,
  cardMenuButtonClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuSurfaceClass,
  modalBodyClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';

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
  const { t } = useTranslation('groupInvite');
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
    toast.success(t('toast.linkCopied'));
    toast.info(t('toast.sendToStudents'));
  };

  const handleResetInvite = () => {
    resetInvite(
      { source: 'classroom' },
      {
        onSuccess: () => {
          toast.success(t('toast.linkReset'));
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
      <ModalContent className={cn(modalContentClass, 'max-w-[600px]')}>
        <div className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{t('title')}</ModalTitle>
            <ModalCloseIcon onClick={handleClose} />
          </div>
          <ModalDescription className={modalDescriptionClass}>{t('description')}</ModalDescription>
        </div>
        <ModalBody className="flex w-full flex-col gap-2 px-6 pb-2">
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
                    placeholder={t('linkPlaceholder')}
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
                    className={cardMenuButtonClass}
                    variant="none"
                    size="icon"
                    data-umami-event="group-invite-menu-open"
                  >
                    <MoreVert className={cardMenuIconClass} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className={cardMenuSurfaceClass}
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  <DropdownMenuItem
                    className={cardMenuItemClass}
                    onClick={handleResetInvite}
                    data-umami-event="group-invite-reset"
                  >
                    <Updates />
                    {t('resetLink')}
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
                {t('studentsCount', { count: classroom?.enrollments_count })}
              </div>
            )}
        </ModalBody>
        <div className={modalFooterClass}>
          <Button
            variant="primary"
            size="m"
            className={modalConfirmButtonClass}
            onClick={handleCopyLink}
            disabled={!inviteLink}
            data-umami-event="group-invite-copy-link-button"
          >
            {t('copyLink')}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};
