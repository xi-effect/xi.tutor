import { useEffect, useState } from 'react';
import { Close } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

/** Плашка скрывается 23.10.2026 в 07:00 мск. */
const MAINTENANCE_NOTICE_UNTIL = Date.parse('2026-10-23T07:00:00+03:00');
const DISMISS_STORAGE_KEY = 'navigation.maintenance-notice.dismissed';

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const cardClassName =
  'border-yellow-100 bg-status-warning-background text-status-warning-text relative rounded-2xl border p-3';

export const isMaintenanceNoticeVisible = (now = Date.now()) => now < MAINTENANCE_NOTICE_UNTIL;

const MaintenanceNoticeCard = ({
  className,
  onDismiss,
}: {
  className?: string;
  onDismiss: () => void;
}) => {
  const { t } = useTranslation('navigation');

  return (
    <div className={cn(cardClassName, className)} role="status">
      <div className="flex items-start justify-between gap-2">
        <p className="text-s-base pt-0.5 font-semibold">{t('maintenance.title')}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('maintenance.dismiss')}
          className="bg-status-warning-background hover:bg-status-warning-background focus:bg-status-warning-background active:bg-status-warning-background -mt-1 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-lg"
        >
          <Close className="size-4 text-yellow-100!" />
        </button>
      </div>
      <p className="text-xs-base mt-1 leading-snug">{t('maintenance.description')}</p>
    </div>
  );
};

const CollapsedMaintenanceNotice = ({ onDismiss }: { onDismiss: () => void }) => {
  const { t } = useTranslation('navigation');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('maintenance.title')}
          className="bg-status-warning-background text-m-base hidden size-10 shrink-0 items-center justify-center rounded-2xl border border-yellow-100 font-semibold text-yellow-100 group-data-[collapsible=icon]:flex"
        >
          !
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={12}
        className="z-50 w-[240px] rounded-2xl border-0 bg-transparent p-0 shadow-none"
      >
        <MaintenanceNoticeCard
          onDismiss={() => {
            setOpen(false);
            onDismiss();
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export const MaintenanceNotice = ({
  className,
  collapsedFallback = true,
}: {
  className?: string;
  collapsedFallback?: boolean;
}) => {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [expired, setExpired] = useState(() => !isMaintenanceNoticeVisible());

  useEffect(() => {
    if (dismissed || expired) return;

    const delay = MAINTENANCE_NOTICE_UNTIL - Date.now();
    if (delay <= 0) {
      setExpired(true);
      return;
    }

    const timer = window.setTimeout(() => setExpired(true), delay);
    return () => window.clearTimeout(timer);
  }, [dismissed, expired]);

  if (expired || dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    } catch {
      // Уведомление скроется в этой сессии, даже если хранилище недоступно.
    }
    setDismissed(true);
  };

  return (
    <>
      <MaintenanceNoticeCard
        className={cn(collapsedFallback && 'group-data-[collapsible=icon]:hidden', className)}
        onDismiss={dismiss}
      />
      {collapsedFallback ? <CollapsedMaintenanceNotice onDismiss={dismiss} /> : null}
    </>
  );
};
