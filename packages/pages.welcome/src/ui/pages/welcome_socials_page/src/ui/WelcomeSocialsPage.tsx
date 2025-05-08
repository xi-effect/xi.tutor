import { WelcomePageLayout } from '../../../../WelcomePageLayout';
import { WelcomeButtons } from '../../../../WelcomeButtons';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@xipkg/form';
import { Input } from '@xipkg/input';
import { TelegramFilled } from '@xipkg/icons';
import { useRouter, useCanGoBack, useNavigate } from '@tanstack/react-router';
import { InputWrapper } from './InputWrapper';
import { type FormData } from '../model';

export const WelcomeSocialsPage = () => {
  const { t } = useTranslation('welcomeSocials');

  const form = useForm<FormData>();

  const { control, watch } = form;
  console.log(t('subtitle.points'));

  // Временные хэндлеры (на период, пока не подключен бэкенд)
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  const backButtonHandler = () => canGoBack && router.history.back();
  const continueButtonHandler = () =>
    navigate({
      to: '/',
    });

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
        <form className="mt-6 flex h-full w-full flex-col gap-2">
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
            <TelegramFilled className="fill-brand-100 h-8 w-8" />
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
          <WelcomeButtons
            customText="Начать работу"
            backButtonHandler={backButtonHandler}
            continueButtonHandler={continueButtonHandler}
          />
        </form>
      </Form>
    </WelcomePageLayout>
  );
};
