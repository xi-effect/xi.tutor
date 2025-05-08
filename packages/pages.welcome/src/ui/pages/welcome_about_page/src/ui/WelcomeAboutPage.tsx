import { WelcomeButtons } from '../../../../WelcomeButtons';
import { WelcomePageLayout } from '../../../../WelcomePageLayout';
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
import { useWelcomeAboutForm } from '../hooks/useWelcomeAboutForm';
import { useRouter, useCanGoBack, useNavigate } from '@tanstack/react-router';
import { FormData } from '../model';

export const WelcomeAboutPage = () => {
  const { t } = useTranslation('welcomeAbout');

  const form = useForm<FormData>();

  const { control, watch, handleSubmit } = form;

  const [inputValue] = watch(['question']);

  const { onWelcomeAboutForm } = useWelcomeAboutForm();
  const onSubmit = () => {
    onWelcomeAboutForm();
  };

  // Временные хэндлеры (на период, пока не подключен бэкенд)
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  const backButtonHandler = () => canGoBack && router.history.back();
  const continueButtonHandler = () =>
    navigate({
      to: '/welcome/socials',
    });

  return (
    <WelcomePageLayout title={t('title')} step={3}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full w-full flex-col">
          <FormField
            control={control}
            name="question"
            defaultValue=""
            render={({ field }) => (
              <FormItem className="mt-8">
                <FormLabel>{t('tutor_question')}</FormLabel>
                <FormControl>
                  <Input
                    className="mt-1"
                    autoComplete="off"
                    type="text"
                    placeholder={t('tutor_placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <WelcomeButtons
            continueType={inputValue?.length ? 'continue' : 'next'}
            continueButtonHandler={continueButtonHandler}
            backButtonHandler={backButtonHandler}
          />
        </form>
      </Form>
    </WelcomePageLayout>
  );
};
