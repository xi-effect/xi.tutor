import { useRouter, useCanGoBack } from '@tanstack/react-router';
import { WelcomePageLayout, WelcomeButtons } from '../../ui';
import { useTranslation } from 'react-i18next';
import { InputWrapper } from './InputWrapper';
import { Input } from '@xipkg/input';
import { TelegramFilled, WhatsAppFilled } from '@xipkg/icons';
import { useWelcomeSocialsForm } from '../../hooks';
import { type WelcomeSocialsFormData } from '../../model';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@xipkg/form';

export const WelcomeSocialsPage = () => {
  const { t } = useTranslation('welcomeSocials');

  const form = useForm<WelcomeSocialsFormData>();

  const { control, watch, handleSubmit } = form;

  // Временные хэндлеры (на период, пока не подключен бэкенд)
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const backButtonHandler = () => canGoBack && router.history.back();

  const { onWelcomeSocialsForm } = useWelcomeSocialsForm();
  const onSubmit = () => {
    onWelcomeSocialsForm();
  };

  const [telegram] = watch(['telegram']);
  const [whatsapp] = watch(['whatsapp']);

  const getStyles = (elem: string) =>
    `${elem?.length ? 'block' : 'hidden group-hover:block group-focus:block'} w-full`;

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
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex h-full w-full flex-col gap-2">
          <InputWrapper tab={1}>
            <TelegramFilled className="fill-brand-100 h-8 w-8" />
            <FormField
              control={control}
              name="telegram"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="group w-full">
                  <FormLabel className="m-0 block w-full font-semibold">Telegram</FormLabel>
                  <FormControl className={getStyles(telegram)}>
                    <Input
                      autoComplete="off"
                      type="text"
                      placeholder="@nickname"
                      {...field}
                      className="h-auto border-none p-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </InputWrapper>
          <InputWrapper tab={2}>
            <WhatsAppFilled className="fill-brand-100 h-8 w-8" />
            <FormField
              control={control}
              name="whatsapp"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="group w-full">
                  <FormLabel className="m-0 block w-full font-semibold">Whatsapp</FormLabel>
                  <FormControl className={getStyles(whatsapp)}>
                    <Input
                      autoComplete="off"
                      type="text"
                      placeholder="@nickname"
                      {...field}
                      className="h-auto border-none p-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </InputWrapper>
          <WelcomeButtons customText="Начать работу" backButtonHandler={backButtonHandler} />
        </form>
      </Form>
    </WelcomePageLayout>
  );
};
