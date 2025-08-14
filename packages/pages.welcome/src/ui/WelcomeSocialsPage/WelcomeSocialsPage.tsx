import { WelcomePageLayout, WelcomeButtons } from '../../ui';
import { useTranslation } from 'react-i18next';
import { InputWrapper } from './InputWrapper';
import { TelegramFilled, WhatsAppFilled, Check } from '@xipkg/icons';
import { useWelcomeSocialsForm } from '../../hooks';
import { Button } from '@xipkg/button';
import { useState } from 'react';
import { useCreateTgConnection, useGetNotificationsStatus } from 'common.services';

export const WelcomeSocialsPage = () => {
  const { t } = useTranslation('welcomeSocials');
  const [tgLink, setTgLink] = useState<string | null>(null);

  const { data } = useGetNotificationsStatus();

  const { onBackwards, onForwards, isLoading } = useWelcomeSocialsForm();
  const { mutate, isPending } = useCreateTgConnection();

  const handleCreateTgConnection = () => {
    if (data.telegram) {
      return;
    }
    mutate(undefined, {
      onSuccess: (data: string) => {
        if (data) {
          setTgLink(data);
        }
      },
    });
  };

  const handleNextStep = () => {
    onForwards();
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
        <InputWrapper tab={1}>
          <TelegramFilled className="fill-brand-100 h-8 w-8" />
          <span className="font-semibold">Telegram</span>
          {data?.telegram ? (
            <div className="ml-auto p-1 sm:p-3">
              <Check className="fill-brand-100" />
            </div>
          ) : isPending ? (
            <div className="text-gray-60 ml-auto py-1 sm:py-3">Формируем ссылку…</div>
          ) : tgLink ? (
            <Button
              variant="ghost"
              className="text-s-base text-brand-100 ml-auto h-8 px-4 py-1.5 sm:h-12"
              onClick={() => window.open(tgLink, '_blank')}
            >
              Перейти в бот
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-s-base text-brand-100 ml-auto h-8 px-4 py-1.5 sm:h-12"
              onClick={handleCreateTgConnection}
            >
              Подключить
            </Button>
          )}
        </InputWrapper>
        <InputWrapper tab={2}>
          <WhatsAppFilled className="fill-brand-100 h-8 w-8" />
          <span className="font-semibold">Вконтакте</span>
          <Button
            variant="ghost"
            className="text-s-base text-brand-100 ml-auto h-8 px-4 py-1.5 sm:h-12"
          >
            Подключить
          </Button>
        </InputWrapper>
      </div>
      <WelcomeButtons
        customText="Начать работу"
        backButtonHandler={onBackwards}
        continueButtonHandler={handleNextStep}
        isLoading={isLoading}
      />
    </WelcomePageLayout>
  );
};
