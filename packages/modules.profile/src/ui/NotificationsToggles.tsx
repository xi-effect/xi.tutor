import { Toggle } from '@xipkg/toggle';
import { useChangeContactsVisibility, useGetNotificationsStatus } from 'common.services';
import { useTranslation } from 'react-i18next';

type TypesMessengersT = 'telegram' | 'whatsapp' | 'email';

type NotificationsTogglesPropsT = {
  type: TypesMessengersT;
};

export const NotificationsToggles = ({ type }: NotificationsTogglesPropsT) => {
  const { t } = useTranslation('profile');

  const typeMap: Record<string, string> = {
    telegram: 'Telegram',
    whatsapp: 'Whatsapp',
    email: 'Email',
  };

  const nameType = typeMap[type] || 'Email';

  const { data } = useGetNotificationsStatus();
  const { mutate, isPending } = useChangeContactsVisibility();

  return (
    <>
      <div className="flex flex-col gap-2">
        {type !== 'email' && (
          <div className="flex flex-row items-center justify-between p-3">
            <div className="flex flex-col gap-1">
              <span className="font-inter text-m-base dark:text-text-primary font-medium">
                {t('notifications.showNickname', { messenger: nameType })}
              </span>

              <span className="text-text-primary dark:text-text-primary font-inter text-s-base font-normal">
                {t('notifications.showNicknameHint')}
              </span>
            </div>

            <Toggle
              checked={data?.telegram.contact.is_public}
              size="l"
              onCheckedChange={(checked) => mutate(checked)}
              disabled={isPending}
            />
          </div>
        )}
      </div>
    </>
  );
};
