import { Toggle } from '@xipkg/toggle';
import {
  NOTIFICATION_GROUP_LABELS,
  NOTIFICATION_GROUP_ORDER,
  useChangeContactsVisibility,
  useGetDeliveryMethods,
  useToggleNotificationGroup,
} from 'common.services';
import { DeliveryMethodKind, NotificationGroupKind } from 'common.types';
import { useTranslation } from 'react-i18next';

type NotificationsTogglesPropsT = {
  deliveryMethodKind: DeliveryMethodKind;
};

export const NotificationsToggles = ({ deliveryMethodKind }: NotificationsTogglesPropsT) => {
  const { t } = useTranslation('profile');
  const { data } = useGetDeliveryMethods();
  const { mutate: toggleGroup, isPending, variables } = useToggleNotificationGroup();
  const { mutate: changeVisibility, isPending: isVisibilityPending } =
    useChangeContactsVisibility();

  const deliveryMethod = data?.[deliveryMethodKind];
  const enabledGroups =
    deliveryMethod?.enabled_notification_categories ??
    deliveryMethod?.enabled_notification_groups ??
    [];

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
    <div className="flex w-full min-w-0 flex-col gap-1 px-1 pb-1">
      {deliveryMethodKind === 'telegram' && deliveryMethod?.related_contact && (
        <div className="flex w-full min-w-0 flex-row items-center justify-between gap-4 p-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-inter text-m-base dark:text-text-primary font-medium">
              {t('notifications.showNickname', { messenger: 'Telegram' })}
            </span>
            <span className="text-text-primary dark:text-text-primary font-inter text-s-base font-normal">
              {t('notifications.showNicknameHint')}
            </span>
          </div>
          <Toggle
            checked={deliveryMethod.related_contact.is_public}
            size="l"
            className="shrink-0"
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
            className="flex w-full min-w-0 flex-row items-center justify-between gap-4 p-3"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-inter text-m-base dark:text-text-primary font-medium">
                {title}
              </span>
              <span className="text-text-primary dark:text-text-primary font-inter text-s-base font-normal">
                {description}
              </span>
            </div>
            <Toggle
              checked={isEnabled}
              size="l"
              className="shrink-0"
              onCheckedChange={(checked) => handleToggleGroup(notificationGroupKind, checked)}
              disabled={isGroupPending(notificationGroupKind)}
            />
          </div>
        );
      })}
    </div>
  );
};
