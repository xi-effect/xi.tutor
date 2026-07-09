import { WelcomePageLayout, WelcomeButtons } from '../../ui';
import { useTranslation } from 'react-i18next';
import { SocialItem } from './SocialItem';
import { TelegramFilled, VK } from '@xipkg/icons';
import { useServiceButton, useWelcomeSocialsForm } from '../../hooks';
import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Check } from '@xipkg/icons';
import { VkAllowMessagesWidget } from 'common.ui';
import { useCreateTgConnection, useGetNotificationsStatus, useVkConnection } from 'common.services';

export const WelcomeSocialsPage = () => {
  const { t } = useTranslation('welcomeSocials');

  const { onBackwards, onForwards, isLoading } = useWelcomeSocialsForm();

  const [tgLink, setTgLink] = useState<string | null>(null);

  const { data } = useGetNotificationsStatus();
  const { mutate, isPending } = useCreateTgConnection();
  const {
    isConnected: isVkConnected,
    isPending: isVkPending,
    connectionData: vkConnectionData,
    handleConnect: handleConnectVk,
    handleCheckConnection: handleCheckVkConnection,
  } = useVkConnection();

  const handleCreateTgConnection = () => {
    if (data?.telegram) return;

    mutate(undefined, {
      onSuccess: (link: string) => {
        if (link) setTgLink(link);
      },
    });
  };

  const tgButton = useServiceButton({
    service: 'telegram',
    createConnection: handleCreateTgConnection,
    link: tgLink,
    isPending,
    isConnected: !!data?.telegram,
  });

  const vkAction = () => {
    if (isVkConnected) {
      return (
        <div className="ml-auto p-1 sm:p-3">
          <Check className="fill-brand-100" />
        </div>
      );
    }

    if (isVkPending) {
      return (
        <div className="text-gray-60 dark:text-gray-80 ml-auto py-1 sm:py-3">Формируем ключ…</div>
      );
    }

    if (!vkConnectionData) {
      return (
        <Button
          variant="none"
          className="text-s-base text-brand-100 ml-auto h-8 px-4 py-1.5 sm:h-12"
          onClick={handleConnectVk}
          data-umami-event="service-connect"
          data-umami-event-service="vk"
        >
          Подключить
        </Button>
      );
    }

    return null;
  };

  return (
    <WelcomePageLayout
      step={3}
      title={t('title')}
      subtitle={
        <>
          <p>{t('subtitle.text')}</p>
          <ul>
            {t('subtitle.points')
              .split(',')
              .map((item, index) => (
                <li key={index} className="list-inside list-disc">
                  {item}
                </li>
              ))}
          </ul>
        </>
      }
    >
      <div className="mt-6 flex flex-col gap-2">
        <SocialItem>
          <TelegramFilled className="fill-brand-100 h-8 w-8" />
          <span className="font-semibold text-gray-100 dark:text-gray-100">Telegram</span>
          {tgButton}
        </SocialItem>
        <SocialItem>
          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-row items-center gap-4">
              <VK className="fill-brand-100 h-8 w-8" />
              <span className="font-semibold text-gray-100 dark:text-gray-100">Вконтакте</span>
              {vkAction()}
            </div>
            {vkConnectionData && !isVkConnected && (
              <div className="flex flex-col gap-3">
                <VkAllowMessagesWidget
                  communityId={vkConnectionData.community_id}
                  connectionKey={vkConnectionData.key}
                />
                <Button
                  size="s"
                  className="self-start"
                  onClick={handleCheckVkConnection}
                  data-umami-event="service-check-connection"
                  data-umami-event-service="vk"
                >
                  Проверить подключение
                </Button>
              </div>
            )}
          </div>
        </SocialItem>
      </div>
      <WelcomeButtons
        customText="Начать работу"
        backButtonHandler={onBackwards}
        continueButtonHandler={onForwards}
        isLoading={isLoading}
      />
    </WelcomePageLayout>
  );
};
