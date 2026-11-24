import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { Alert, AlertDescription, AlertIcon } from '@xipkg/alert';
import { Button } from '@xipkg/button';
import { Copy, InfoCircle } from '@xipkg/icons';
import { AnimatePresence, animate, motion, useReducedMotion, type Transition } from 'motion/react';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { Skeleton, modalTitleClass } from 'common.ui';
import { writeText } from 'common.platform';
import { toast } from 'sonner';
import { env } from 'common.env';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getInviteTrackingId,
  trackProductEvent,
  type InviteAnalyticsSource,
} from 'common.utils';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';
import { useCurrentInvite } from '../services/useCurrentInvite';
import { useMarkFirstStepDone } from 'common.services';

type InviteCopyMode = 'link' | 'message';

const inviteHeightTransition: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 32,
  mass: 0.85,
};

const inviteContentTransition: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

const InviteCopyPreview = ({
  mode,
  message,
  inviteUrl,
  copyLabel,
  onCopy,
}: {
  mode: InviteCopyMode;
  message: string;
  inviteUrl: string;
  copyLabel: string;
  onCopy: () => void;
}) => {
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLButtonElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const applyHeight = () => {
      const next = element.offsetHeight;
      if (next <= 0) return;
      setHeight((current) =>
        typeof current === 'number' && Math.abs(current - next) < 0.5 ? current : next,
      );
    };

    applyHeight();
    const observer = new ResizeObserver(applyHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mode, message, inviteUrl]);

  useEffect(() => {
    setAnimationsEnabled(true);
  }, []);

  return (
    <motion.div
      className="overflow-hidden"
      initial={false}
      animate={{ height }}
      transition={reduceMotion || !animationsEnabled ? { duration: 0 } : inviteHeightTransition}
    >
      <button
        ref={contentRef}
        type="button"
        onClick={onCopy}
        aria-label={copyLabel}
        className="border-border-default hover:border-border-focus hover:bg-background-page focus-visible:ring-ring relative w-full cursor-pointer rounded-lg border bg-transparent p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={mode}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={reduceMotion ? { duration: 0 } : inviteContentTransition}
          >
            {mode === 'message' ? (
              <p className="text-text-primary min-w-0 text-sm break-words whitespace-pre-line">
                {message}
              </p>
            ) : (
              <p className="text-text-primary min-w-0 text-sm break-all">{inviteUrl}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    </motion.div>
  );
};

const InviteCopyAction = ({
  mode,
  label,
  disabled,
  onClick,
}: {
  mode: InviteCopyMode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) => {
  const reduceMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const [isSm, setIsSm] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 640px)').matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 640px)');
    const update = () => setIsSm(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setAnimationsEnabled(true);
  }, []);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const sizer = sizerRef.current;
    const shell = shellRef.current;
    if (!shell) return;
    if (!isSm) {
      shell.style.width = '';
      return;
    }
    if (!button || !sizer) return;

    let animation: ReturnType<typeof animate> | undefined;

    const applyWidth = () => {
      const labelWidth = sizer.scrollWidth;
      if (labelWidth <= 0) return;

      const styles = getComputedStyle(button);
      const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const border = parseFloat(styles.borderLeftWidth) + parseFloat(styles.borderRightWidth);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      const icon = button.querySelector('svg')?.getBoundingClientRect().width ?? 0;
      const next = Math.ceil(labelWidth + icon + padding + border + gap);
      const current = Number.parseFloat(shell.style.width);

      if (!Number.isFinite(current) || reduceMotion || !animationsEnabled) {
        shell.style.width = `${next}px`;
        return;
      }
      if (Math.abs(current - next) < 0.5) return;

      animation?.stop();
      animation = animate(shell, { width: next }, inviteHeightTransition);
    };

    applyWidth();
    const observer = new ResizeObserver(applyWidth);
    observer.observe(sizer);
    return () => {
      const held = Number.parseFloat(shell.style.width);
      animation?.stop();
      if (held > 0) shell.style.width = `${held}px`;
      observer.disconnect();
    };
  }, [label, isSm, reduceMotion, animationsEnabled]);

  return (
    <div
      ref={shellRef}
      className={cn(
        'order-1 min-w-0 shrink-0 overflow-hidden sm:order-2',
        isSm ? 'w-max' : 'w-full',
      )}
    >
      <Button
        ref={buttonRef}
        type="button"
        variant="primary"
        className="relative w-full min-w-0 gap-1.5"
        onClick={onClick}
        disabled={disabled}
      >
        <Copy size="sm" className="fill-action-primary-text size-4 shrink-0" />
        <span className="relative min-w-0">
          <span
            ref={sizerRef}
            aria-hidden
            className="pointer-events-none invisible absolute w-max whitespace-nowrap"
          >
            {label}
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={mode}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={reduceMotion ? { duration: 0 } : inviteContentTransition}
              className="block whitespace-nowrap"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
      </Button>
    </div>
  );
};

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
  const markInviteDone = useMarkFirstStepDone('invite');

  const [confirmingRefresh, setConfirmingRefresh] = useState(false);
  const [copyMode, setCopyMode] = useState<InviteCopyMode>('link');
  const copyModeTabs = useMemo(
    () => [
      { id: 'link', label: t('inviteModalV2.switcher.link') },
      { id: 'message', label: t('inviteModalV2.switcher.message') },
    ],
    [t],
  );

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
      await writeText(message);
    } catch {
      toast.error(t('inviteModalV2.toast.copyFailed'));
      return;
    }

    toast.success(t('inviteModalV2.toast.messageCopied'), {
      description: t('inviteModalV2.toast.sendHint'),
    });
    markInviteDone('copy');
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
      await writeText(inviteUrl);
    } catch {
      toast.error(t('inviteModalV2.toast.copyFailed'));
      return;
    }

    toast.success(t('inviteModalV2.toast.linkCopied'), {
      description: t('inviteModalV2.toast.sendHint'),
    });
    markInviteDone('copy');
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
      <ModalContent className="max-w-[600px]" data-first-step="invite-link">
        <ModalHeader>
          <ModalCloseButton onClick={handleClose} />
          <ModalTitle className={cn(modalTitleClass, 'max-w-[calc(100%-48px)]')}>
            {t('inviteModalV2.title')}
          </ModalTitle>
          <ModalDescription className="text-text-secondary mt-3!">
            {t('inviteModalV2.description')}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="flex min-w-0 flex-col gap-3">
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
              <SwitcherAnimate
                layoutId="student-invite-copy-mode"
                tabs={copyModeTabs}
                activeTab={copyMode}
                onChange={(tabId) => setCopyMode(tabId === 'message' ? 'message' : 'link')}
                className="bg-background-subtle h-9 w-full gap-0.5 rounded-[10px] p-1"
                tabClassName="h-7 flex-1 rounded-lg px-2 py-1 text-sm font-medium data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-text-secondary data-[state=active]:text-text-primary data-[state=active]:hover:text-text-primary"
                indicatorClassName="rounded-lg border-0 bg-background-surface shadow-sm"
              />
              <InviteCopyPreview
                mode={copyMode}
                message={message}
                inviteUrl={inviteUrl ?? ''}
                copyLabel={
                  copyMode === 'message'
                    ? t('inviteModalV2.actions.copyMessage')
                    : t('inviteModalV2.actions.copyLink')
                }
                onCopy={copyMode === 'message' ? handleCopyMessage : handleCopyLink}
              />
              <Alert variant="success" className="w-full max-w-none items-start gap-3 p-3">
                <AlertIcon className="mt-0.5">
                  <InfoCircle className="fill-status-success-text size-5" />
                </AlertIcon>
                <AlertDescription className="min-w-0 text-sm leading-5">
                  {t('inviteModalV2.info.classroomCreated')}
                </AlertDescription>
              </Alert>
            </>
          )}
        </ModalBody>

        <ModalFooter className="flex flex-col gap-2">
          {confirmingRefresh ? (
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="none"
                className="w-full sm:w-auto"
                onClick={() => setConfirmingRefresh(false)}
              >
                {t('inviteModalV2.confirm.cancel')}
              </Button>
              <Button
                variant="primary"
                className="w-full sm:w-auto"
                onClick={handleConfirmRefreshLink}
              >
                {t('inviteModalV2.confirm.confirm')}
              </Button>
            </div>
          ) : showMainFooter ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="none"
                className="text-text-link hover:text-text-link order-2 w-full sm:order-1 sm:w-auto"
                onClick={() => setConfirmingRefresh(true)}
                disabled={!hasContent || isRefreshing}
                loading={isRefreshing}
              >
                {t('inviteModalV2.actions.refreshLink')}
              </Button>
              <InviteCopyAction
                mode={copyMode}
                label={
                  copyMode === 'message'
                    ? t('inviteModalV2.actions.copyMessage')
                    : t('inviteModalV2.actions.copyLink')
                }
                disabled={!hasContent}
                onClick={copyMode === 'message' ? handleCopyMessage : handleCopyLink}
              />
            </div>
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
