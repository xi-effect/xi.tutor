import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@xipkg/form';
import { Eyeoff, Eyeon } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@tanstack/react-router';

import { LinkTanstack, Logo } from 'common.ui';
import { useGetUrlWithParams } from '../../../common.utils/src/useGetUrlWithParams';

import { FormData, useFormSchema } from '../model';
import { useSigninForm } from '../hooks';

export const SignInPage = () => {
  const { t } = useTranslation('signin');

  const formSchema = useFormSchema();
  const { onSigninForm, isPending } = useSigninForm();
  const getUrlWithParams = useGetUrlWithParams();

  const search = useSearch({ strict: false }) as { redirect?: string };
  const isInviteRedirect = search.redirect?.includes('/invite');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const changePasswordShow = () => setIsPasswordShow((prev) => !prev);

  const onSubmit = (data: FormData) => {
    onSigninForm(data, form.setError);
  };

  return (
    <div className="xs:h-screen dark:bg-gray-0 flex h-[100dvh] w-screen flex-col flex-wrap content-center justify-center p-1">
      <div className="xs:border xs:border-gray-10 xs:rounded-2xl dark:bg-gray-5 flex h-fit min-h-[600px] w-full max-w-[420px] p-8">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
            <div className="self-center">
              <Logo height={22} width={180} />
            </div>
            <h1 className="flex justify-center text-2xl font-semibold dark:text-gray-100">
              {t('sign_in')}
            </h1>

            {isInviteRedirect && (
              <div className="text-brand-100 bg-brand-0 rounded-2xl p-4 text-center text-sm whitespace-pre-line">
                {t('invite_message')}
              </div>
            )}

            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem className="pt-4">
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input error={!!errors?.email} autoComplete="on" type="email" {...field} />
                  </FormControl>
                  <FormMessage className="pt-0" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input
                      error={!!errors?.password}
                      autoComplete="on"
                      type={isPasswordShow ? 'text' : 'password'}
                      afterClassName="cursor-pointer"
                      after={
                        isPasswordShow ? (
                          <Eyeoff className="fill-gray-60" />
                        ) : (
                          <Eyeon className="fill-gray-60" />
                        )
                      }
                      afterProps={{
                        onClick: changePasswordShow,
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="pt-0" />
                </FormItem>
              )}
            />

            <LinkTanstack
              size="l"
              variant="always"
              to="/reset-password"
              data-umami-event="auth-forgot-password-link"
            >
              {t('forgot_password')}
            </LinkTanstack>

            <div className="flex h-full w-full items-end justify-between">
              <div className="flex h-[48px] items-center">
                <LinkTanstack
                  id="to-signup-link"
                  size="l"
                  theme="brand"
                  variant="hover"
                  to={getUrlWithParams('/signup')}
                  data-umami-event="auth-signup-link"
                >
                  {t('register')}
                </LinkTanstack>
              </div>

              {isPending ? (
                <Button type="submit" loading className="w-24" />
              ) : (
                <Button
                  variant="primary"
                  type="submit"
                  className="w-24"
                  disabled={isPending}
                  data-umami-event="auth-signin-button"
                >
                  {t('sign_in_button')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
