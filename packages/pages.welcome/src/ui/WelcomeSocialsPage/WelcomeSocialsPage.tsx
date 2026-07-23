import { WelcomePageLayout, WelcomeButtons } from '../../ui';
import { useTranslation } from 'react-i18next';
import { SocialItem } from './SocialItem';
import { TelegramFilled, VK, Check } from '@xipkg/icons';
import { useServiceButton, useWelcomeSocialsForm } from '../../hooks';
import { useOnboardingAnalytics } from '../../hooks/useOnboardingAnalytics';
import { VkConnectButton } from 'common.ui';
import { useTgConnection, useVkConnection } from 'common.services';

export const WelcomeSocialsPage = () => {
  const { t } = useTranslation('welcomeSocials');
  useOnboardingAnalytics({ step: 'notifications' });

  const { onBackwards, onForwards, isLoading } = useWelcomeSocialsForm();

  const {
    isActive: isTgActive,
    isPending: isTgPending,
    isAwaitingConfirmation: isTgAwaitingConfirmation,
    link: tgLink,
    handleConnect: handleConnectTg,
    handleOpenLink: handleOpenTgLink,
  } = useTgConnection();

  const {
    isActive: isVkActive,
    isPending: isVkPending,
    isWidgetReady: isVkWidgetReady,
    isAwaitingConfirmation: isVkAwaitingConfirmation,
    connectionData: vkConnectionData,
    handleConnect: handleConnectVk,
    handleWidgetInteraction: handleVkWidgetInteraction,
  } = useVkConnection();

  const tgButton = useServiceButton({
    service: 'telegram',
    createConnection: handleConnectTg,
    openLink: handleOpenTgLink,
    link: tgLink,
    isPending: isTgPending,
    isAwaitingConfirmation: isTgAwaitingConfirmation,
    isConnected: isTgActive,
  });

  const vkAction = () => {
    if (isVkActive) {
      return (
        <div className="ml-auto p-1 sm:p-3">
          <Check className="fill-brand-100" />
        </div>
      );
    }

    return (
      <VkConnectButton
        label={isVkAwaitingConfirmation ? 'Ожидаем…' : 'Подключить'}
        isPreparing={isVkPending && !isVkWidgetReady}
        isAwaitingConfirmation={isVkAwaitingConfirmation}
        groupId={vkConnectionData?.group_id}
        connectionKey={vkConnectionData?.key}
        onFallbackClick={handleConnectVk}
        onWidgetInteraction={handleVkWidgetInteraction}
        data-umami-event="service-connect"
        data-umami-event-service="vk"
      />
    );
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
          <VK className="h-8 w-8 !text-[#0077FF]" />
          <span className="font-semibold text-gray-100 dark:text-gray-100">Вконтакте</span>
          {vkAction()}
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
