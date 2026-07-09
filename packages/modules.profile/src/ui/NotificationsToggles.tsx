import { Toggle } from '@xipkg/toggle';
import {
  NOTIFICATION_GROUP_LABELS,
  NOTIFICATION_GROUP_ORDER,
  useChangeContactsVisibility,
  useGetNotificationsStatus,
  useToggleNotificationGroup,
} from 'common.services';
import { DeliveryMethodKind, NotificationGroupKind } from 'common.types';

type NotificationsTogglesPropsT = {
  deliveryMethodKind: DeliveryMethodKind;
};

export const NotificationsToggles = ({ deliveryMethodKind }: NotificationsTogglesPropsT) => {
  const { data } = useGetNotificationsStatus();
  const { mutate: toggleGroup, isPending, variables } = useToggleNotificationGroup();
  const { mutate: changeVisibility, isPending: isVisibilityPending } =
    useChangeContactsVisibility();

  const deliveryMethod = data?.[deliveryMethodKind];
  const enabledGroups = deliveryMethod?.enabled_notification_groups ?? [];

  const handleToggleGroup = (notificationGroupKind: NotificationGroupKind, checked: boolean) => {
    toggleGroup({
      deliveryMethodKind,
      notificationGroupKind,
      enabled: checked,
    });
  };

  const isGroupPending = (notificationGroupKind: NotificationGroupKind) =>
    isPending &&
    variables?.deliveryMethodKind === deliveryMethodKind &&
    variables?.notificationGroupKind === notificationGroupKind;

  return (
    <div className="flex flex-col gap-2">
      {deliveryMethodKind === 'telegram' && deliveryMethod?.related_contact && (
        <div className="flex flex-row items-center justify-between p-3">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-m-base font-medium dark:text-gray-100">
              Отображать ник в Telegram в профиле
            </span>
            <span className="text-gray-80 dark:text-gray-80 font-inter text-s-base font-normal">
              Другие участники увидят ваши контакты
            </span>
          </div>
          <Toggle
            checked={deliveryMethod.related_contact.is_public}
            size="l"
            onCheckedChange={(checked) => changeVisibility(checked)}
            disabled={isVisibilityPending}
          />
        </div>
      )}

      {NOTIFICATION_GROUP_ORDER.map((notificationGroupKind) => {
        const { title, description } = NOTIFICATION_GROUP_LABELS[notificationGroupKind];
        const isEnabled = enabledGroups.includes(notificationGroupKind);

        return (
          <div
            key={notificationGroupKind}
            className="flex flex-row items-center justify-between p-3"
          >
            <div className="flex flex-col gap-1">
              <span className="font-inter text-m-base font-medium dark:text-gray-100">{title}</span>
              <span className="text-gray-80 dark:text-gray-80 font-inter text-s-base font-normal">
                {description}
              </span>
            </div>
            <Toggle
              checked={isEnabled}
              size="l"
              onCheckedChange={(checked) => handleToggleGroup(notificationGroupKind, checked)}
              disabled={isGroupPending(notificationGroupKind)}
            />
          </div>
        );
      })}
    </div>
  );
};
