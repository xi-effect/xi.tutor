import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ModalTitle,
  ModalDescription,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalTrigger,
  ModalCloseButton,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Copy } from '@xipkg/icons';
import { Skeleton } from 'common.ui';
import { toast } from 'sonner';
import { env } from 'common.env';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getInviteTrackingId,
  trackProductEvent,
  type InviteAnalyticsSource,
} from 'common.utils';
import { useTranslation } from 'react-i18next';
import { useCurrentInvite } from '../services/useCurrentInvite';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

type ModalInvitationV2Props = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  analyticsSource?: InviteAnalyticsSource;
};

export const ModalInvitationV2 = ({
  children,
  open: controlledOpen,
  onOpenChange,
  analyticsSource = 'unknown',
}: ModalInvitationV2Props) => {
  const { t } = useTranslation('invitesModal');
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (value: boolean) => onOpenChange?.(value) : setInternalOpen;

  const handleClose = () => {
    setOpen(false);
    cleanupBodyScrollLock();
  };

  useEffect(() => {
    if (open === false) cleanupBodyScrollLock();
    return cleanupBodyScrollLock;
  }, [open]);

  const {
    currentInvite,
    isListError,
    refetch,
    isCreating,
    isCreateError,
    isCreateLimitReached,
    isRefreshing,
    retryCreate,
    refreshCurrentInvite,
  } = useCurrentInvite(analyticsSource);

  const [confirmingRefresh, setConfirmingRefresh] = useState(false);

  // Модалка смонтирована постоянно (см. использование через children/trigger),
  // поэтому явный refetch на переход open:false -> true подхватывает ссылку,
  // созданную или обновлённую в другой вкладке.
  const wasOpenRef = useRef(open);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      refetch();
    }
    wasOpenRef.current = open;
  }, [open, refetch]);

  const viewedForOpenRef = useRef(false);
  useEffect(() => {
    if (!open) {
      viewedForOpenRef.current = false;
      return;
    }
    if (viewedForOpenRef.current) return;
    viewedForOpenRef.current = true;
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_VIEWED, {
      source: analyticsSource,
    });
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_MODAL_VIEWED, {
      invite_flow_version: 2,
      source: analyticsSource,
    });
  }, [open, analyticsSource]);

  const inviteUrl = currentInvite
    ? `${env.VITE_APP_DOMAIN}/invite/${currentInvite.code}`
    : undefined;
  const message =
    currentInvite && inviteUrl ? t('inviteModalV2.message.template', { url: inviteUrl }) : '';

  const handleCopyMessage = async () => {
    if (!currentInvite || !message) return;

    try {
      await navigator.clipboard.writeText(message);
    } catch {
      toast.error(t('inviteModalV2.toast.copyFailed'));
      return;
    }

    toast.success(t('inviteModalV2.toast.messageCopied'), {
      description: t('inviteModalV2.toast.sendHint'),
    });
    const invite_tracking_id = await getInviteTrackingId(currentInvite.code);
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_MESSAGE_COPIED, {
      invite_flow_version: 2,
      source: analyticsSource,
      invite_id: String(currentInvite.id),
      invite_tracking_id,
    });
  };

  const handleCopyLink = async () => {
    if (!currentInvite || !inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      toast.error(t('inviteModalV2.toast.copyFailed'));
      return;
    }

    toast.success(t('inviteModalV2.toast.linkCopied'), {
      description: t('inviteModalV2.toast.sendHint'),
    });
    const invite_tracking_id = await getInviteTrackingId(currentInvite.code);
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_LINK_COPIED, {
      invite_id: String(currentInvite.id),
      source: analyticsSource,
      invite_flow_version: 2,
      invite_tracking_id,
    });
  };

  const handleConfirmRefreshLink = () => {
    if (!currentInvite) return;
    const previousInviteId = String(currentInvite.id);
    setConfirmingRefresh(false);
    refreshCurrentInvite({
      onSuccess: (invite) => {
        void getInviteTrackingId(invite.code).then((invite_tracking_id) => {
          trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_NEW_LINK_CREATED, {
            invite_flow_version: 2,
            source: analyticsSource,
            invite_id: String(invite.id),
            previous_invite_id: previousInviteId,
            invite_tracking_id,
          });
        });
      },
    });
  };

  const hasContent = currentInvite != null;
  const showListError = isListError;
  const showCreateError = !hasContent && isCreateError && !isCreating;
  const showSkeleton = !showListError && !showCreateError && !hasContent && !confirmingRefresh;
  const showMainFooter = !showListError && !showCreateError;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (typeof next === 'boolean') setOpen(next);
        if (next === false) cleanupBodyScrollLock();
      }}
    >
      {children != null && <ModalTrigger asChild>{children}</ModalTrigger>}
      <ModalContent className="max-w-[600px]">
        <ModalHeader>
          <ModalCloseButton onClick={handleClose} />
          <ModalTitle className="text-text-primary max-w-[calc(100%-48px)]">
            {t('inviteModalV2.title')}
          </ModalTitle>
          <ModalDescription className="text-text-secondary">
            {t('inviteModalV2.description')}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-3 px-4 py-2">
          {showListError ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-text-primary">{t('inviteModalV2.errors.listError')}</p>
              <Button variant="secondary" onClick={() => refetch()}>
                {t('inviteModalV2.errors.retry')}
              </Button>
            </div>
          ) : confirmingRefresh ? (
            <div className="flex flex-col gap-2 p-2">
              <p className="text-text-primary font-medium">{t('inviteModalV2.confirm.title')}</p>
              <p className="text-text-secondary text-sm">
                {t('inviteModalV2.confirm.description')}
              </p>
            </div>
          ) : showCreateError ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-text-primary">
                {isCreateLimitReached
                  ? t('inviteModalV2.errors.limitReached')
                  : t('inviteModalV2.errors.createError')}
              </p>
              {isCreateLimitReached ? (
                <p className="text-text-secondary text-sm">
                  {t('inviteModalV2.errors.limitReachedHint')}
                </p>
              ) : null}
              <Button variant="secondary" onClick={() => retryCreate()}>
                {isCreateLimitReached
                  ? t('inviteModalV2.errors.showExisting')
                  : t('inviteModalV2.errors.retry')}
              </Button>
            </div>
          ) : showSkeleton ? (
            <div className="flex flex-col gap-2 py-2">
              <Skeleton variant="text" lines={4} />
            </div>
          ) : (
            <>
              <div className="border-border-default flex items-start gap-2 rounded-lg border p-3">
                <p className="dark:text-text-primary min-w-0 flex-1 text-sm whitespace-pre-line">
                  {message}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="s"
                  className="shrink-0 gap-1.5"
                  onClick={handleCopyMessage}
                  disabled={!hasContent}
                >
                  <Copy size="sm" className="fill-action-primary-text size-4" />
                  {t('inviteModalV2.actions.copyMessage')}
                </Button>
              </div>

              <div className="flex items-center gap-3 px-1">
                <div className="bg-border-default h-px flex-1" />
                <span className="text-text-secondary shrink-0 text-sm">
                  {t('inviteModalV2.or')}
                </span>
                <div className="bg-border-default h-px flex-1" />
              </div>

              <div className="border-border-default flex items-center gap-2 rounded-lg border p-3">
                <span className="dark:text-text-primary min-w-0 flex-1 truncate text-sm">
                  {inviteUrl}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="s"
                  className="shrink-0 gap-1.5"
                  onClick={handleCopyLink}
                  disabled={!hasContent}
                >
                  <Copy size="sm" className="fill-icon-primary size-4" />
                  {t('inviteModalV2.actions.copyLink')}
                </Button>
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter className="flex flex-col gap-2">
          {confirmingRefresh ? (
            <div className="flex w-full justify-end gap-2">
              <Button variant="none" onClick={() => setConfirmingRefresh(false)}>
                {t('inviteModalV2.confirm.cancel')}
              </Button>
              <Button variant="primary" onClick={handleConfirmRefreshLink}>
                {t('inviteModalV2.confirm.confirm')}
              </Button>
            </div>
          ) : showMainFooter ? (
            <div className="flex w-full">
              <Button
                variant="ghost"
                onClick={() => setConfirmingRefresh(true)}
                disabled={!hasContent || isRefreshing}
                loading={isRefreshing}
              >
                {t('inviteModalV2.actions.refreshLink')}
              </Button>
            </div>
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
