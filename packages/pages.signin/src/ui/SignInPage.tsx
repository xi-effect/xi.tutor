import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Eyeoff, Eyeon } from '@xipkg/icons';
import { Link } from '@xipkg/link';
import { useTranslation } from 'react-i18next';
import { FormSchema, FormData } from '../model/formSchema';
import { InvitationMessage } from './InvitationMessage';
import { useSigninForm } from '../hooks';

export const SignInPage = () => {
  const { t } = useTranslation('signin'); // Используем namespace "auth"

  const query = new URLSearchParams(window.location.search);
  const communityName = query.get('community');

  const { onSigninForm, isPending, error } = useSigninForm();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const changePasswordShow = () => setIsPasswordShow((prev) => !prev);

  const getSignupHref = () => {
    if (query.has('iid') && query.get('community')) {
      return `/signup?iid=${query.get('iid')}&community=${query.get('community')}`;
    }
    return '/signup';
  };

  const onSubmit = (data: FormData) => {
    onSigninForm(data);
  };

  return (
    <div className="xs:h-screen flex h-[100dvh] w-screen flex-col flex-wrap content-center justify-center p-1">
      <div className="xs:border xs:border-gray-10 xs:rounded-2xl flex h-[600px] w-full max-w-[420px] p-8">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
            <div className="flex justify-center">Logo</div>
            <h1 className="flex justify-center text-2xl font-semibold">{t('sign_in')}</h1>
            {communityName && <InvitationMessage communityName={communityName} />}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem className="pt-4">
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input error={!!errors?.email} autoComplete="on" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Link size="l" variant="always" href="/reset-password">
              {t('forgot_password')}
            </Link>
            <div className="flex h-full w-full items-end justify-between">
              <div className="flex h-[48px] items-center">
                <Link
                  id="to-signup-link"
                  size="l"
                  theme="brand"
                  variant="hover"
                  href={getSignupHref()}
                >
                  {t('register')}
                </Link>
              </div>
              {!isPending ? (
                <Button variant="default" type="submit" className="w-24">
                  {t('sign_in_button')}
                </Button>
              ) : (
                <Button variant="default-spinner" className="w-24" disabled />
              )}
            </div>
            {error && <div className="text-red-500">{error}</div>}
          </form>
        </Form>
      </div>
    </div>
  );
};
