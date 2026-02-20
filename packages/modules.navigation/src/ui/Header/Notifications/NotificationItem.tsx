import { Check } from '@xipkg/icons';
import { Button } from '@xipkg/button';
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

  // Обработчик клика по кнопке прочтения - только пометить как прочитанное
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }
  };

  const title = generateNotificationTitle(notification);
  const description = generateNotificationDescription(notification);
  const relativeTime = formatNotificationDate(notification.created_at);
  const fullTime = formatFullNotificationDate(notification.created_at);

  const className = cn(
    `flex h-full items-start gap-2 rounded-4 p-3 ${
      !notification.is_read ? 'bg-brand-0 hover:bg-brand-0' : 'bg-gray-0 hover:bg-gray-5'
    }`,
  );

  const content = (
    <>
      <NotificationAvatar
        kind={notification.payload.kind}
        classroomId={notification.payload.classroom_id}
        recipientInvoiceId={notification.payload.recipient_invoice_id}
      />

      <div className="flex flex-1 flex-col gap-1">
        <span className="text-m-base font-medium text-gray-100">{title}</span>
        <span className="text-gray-80 text-s-base font-normal">{description}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-fit" asChild>
              <span className="text-gray-80 text-xs-base font-normal">{relativeTime}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{fullTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!notification.is_read && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="none"
                size="sm"
                className="group/button bg-gray-0 hover:bg-brand-80 size-6 rounded-sm p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleMarkAsRead}
              >
                <Check className="group-hover/button:fill-gray-0 size-3 fill-gray-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Отметить как прочитанное</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
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
