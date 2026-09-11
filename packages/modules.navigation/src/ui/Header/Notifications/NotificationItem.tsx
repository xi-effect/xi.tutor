import { DropdownMenuItem } from '@xipkg/dropdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import type { NotificationT } from 'common.types';
import {
  generateNotificationTitle,
  generateNotificationDescription,
  generateNotificationAction,
  getNotificationOpensModal,
  getCustomNotificationModalPayload,
  formatNotificationDate,
  formatFullNotificationDate,
} from 'common.services';
import type { CustomNotificationModalPayload } from 'common.services';
import { NotificationAvatar } from './NotificationAvatar';
import type { NotificationLinkNavigateT } from './notificationsNavigation';

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onNavigate,
  onClose,
  onOpenCustomModal,
  asDropdownItem = true,
}: {
  notification: NotificationT;
  onMarkAsRead: (id: string) => Promise<void>;
  onNavigate: NotificationLinkNavigateT;
  onClose: () => void;
  onOpenCustomModal: (payload: CustomNotificationModalPayload) => void;
  asDropdownItem?: boolean;
}) => {
  // Обработчик клика по уведомлению - переход на целевую страницу или открытие модалки
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }

    onClose();

    if (getNotificationOpensModal(notification)) {
      const payload = getCustomNotificationModalPayload(notification);
      if (payload) onOpenCustomModal(payload);
      return;
    }

    const url = generateNotificationAction(notification);
    if (url) {
      onNavigate(url);
    }
  };

  const title = generateNotificationTitle(notification);
  const description = generateNotificationDescription(notification);
  const relativeTime = formatNotificationDate(notification.created_at);
  const fullTime = formatFullNotificationDate(notification.created_at);

  const className = cn(
    `flex h-full items-start gap-2 rounded-[16px] p-3 ${
      !notification.is_read
        ? 'bg-status-info-background hover:bg-status-info-background'
        : 'bg-background-surface hover:bg-background-page'
    }`,
  );

  const content = (
    <>
      <NotificationAvatar
        kind={notification.payload.kind}
        classroomId={
          'classroom_id' in notification.payload &&
          typeof notification.payload.classroom_id === 'number'
            ? notification.payload.classroom_id
            : undefined
        }
        recipientInvoiceId={
          'recipient_invoice_id' in notification.payload &&
          typeof notification.payload.recipient_invoice_id === 'number'
            ? notification.payload.recipient_invoice_id
            : undefined
        }
      />

      <div className="flex flex-1 flex-col gap-1">
        <span className="text-s-base text-text-primary font-medium">{title}</span>
        <span className="text-text-primary text-xs-base font-normal">{description}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-fit" asChild>
              <span className="text-text-primary text-xxs-base font-normal">{relativeTime}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{fullTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );

  if (asDropdownItem) {
    return (
      <DropdownMenuItem className={className} onClick={handleClick}>
        {content}
      </DropdownMenuItem>
    );
  }

  return (
    <button type="button" className={cn(className, 'w-full text-left')} onClick={handleClick}>
      {content}
    </button>
  );
};
