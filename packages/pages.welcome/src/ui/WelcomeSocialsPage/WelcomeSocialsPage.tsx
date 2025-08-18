import { WelcomePageLayout, WelcomeButtons } from '../../ui';
import { useTranslation } from 'react-i18next';
import { SocialItem } from './SocialItem';
import { TelegramFilled } from '@xipkg/icons';
import { useServiceButton, useWelcomeSocialsForm } from '../../hooks';
import { useState } from 'react';
import { useCreateTgConnection, useGetNotificationsStatus } from 'common.services';

export const WelcomeSocialsPage = () => {
  const { t } = useTranslation('welcomeSocials');

  const { onBackwards, onForwards, isLoading } = useWelcomeSocialsForm();

  const [tgLink, setTgLink] = useState<string | null>(null);

  const { data } = useGetNotificationsStatus();
  const { mutate, isPending } = useCreateTgConnection();

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

  // const vkButton = useServiceButton({
  //   service: 'ВКонтакте',
  //   isConnected: false,
  // });

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
          <span className="font-semibold">Telegram</span>
          {tgButton}
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
