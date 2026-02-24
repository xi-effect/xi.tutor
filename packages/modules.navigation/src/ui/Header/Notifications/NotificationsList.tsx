import { cn } from '@xipkg/utils';
import type { NotificationT } from 'common.types';
import type { CustomNotificationModalPayload } from 'common.services';
import { NotificationItem } from './NotificationItem';
import type { NotificationLinkNavigateT } from './notificationsNavigation';

export const NotificationsList = ({
  notifications,
  isMobile,
  isLoading,
  isFetchingNextPage,
  onMarkAsRead,
  onNavigate,
  onClose,
  onOpenCustomModal,
  scrollAreaRef,
}: {
  notifications: NotificationT[];
  isMobile: boolean;
  isLoading: boolean;
  isFetchingNextPage?: boolean;
  onMarkAsRead: (id: string) => Promise<void>;
  onNavigate: NotificationLinkNavigateT;
  onClose: () => void;
  onOpenCustomModal: (payload: CustomNotificationModalPayload) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div
      ref={scrollAreaRef}
      className={cn('overflow-y-auto', isMobile ? 'max-h-[calc(100dvh-200px)]' : 'h-[300px] px-1')}
    >
      {notifications.length > 0 ? (
        <>
          <div className="group flex flex-col gap-1">
            {notifications.map((notification: NotificationT) => (
              <div key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onNavigate={onNavigate}
                  onClose={onClose}
                  onOpenCustomModal={onOpenCustomModal}
                  asDropdownItem={!isMobile}
                />
              </div>
            ))}
          </div>

          {(isLoading || isFetchingNextPage) && (
            <div className="flex justify-center p-4">
              <span className="text-gray-80 text-s-base">Загрузка...</span>
            </div>
          )}
        </>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center',
            isMobile ? 'h-[200px]' : 'h-[300px]',
          )}
        >
          <span className="text-gray-80 text-m-base font-normal">Уведомлений нет</span>
        </div>
      )}
    </div>
  );
};
