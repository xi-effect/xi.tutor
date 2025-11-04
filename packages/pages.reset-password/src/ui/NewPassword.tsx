import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LinkTanstack, Logo } from 'common.ui';

import { Button } from '@xipkg/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Eyeoff, Eyeon } from '@xipkg/icons';
import { Input } from '@xipkg/input';

import { useNewPassword } from '../hooks/useNewPassword';
import { FormDataPassword } from '../model/formSchemaPassword';

export const NewPassword = ({ token }: { token: string }) => {
  const { t } = useTranslation('resetPassword');
  const { form, onSubmit } = useNewPassword(token);

  const [isPasswordShowFirst, setIsPasswordShowFirst] = useState(false);
  const [isPasswordShowSecond, setIsPasswordShowSecond] = useState(false);

  return (
    <Form<FormDataPassword> {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full w-full flex-col space-y-4"
      >
        <div className="self-center">
          <Logo height={22} width={180} />
        </div>

        <h1 className="self-center text-2xl font-semibold dark:text-gray-100">{t('title')}</h1>

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState: { error } }) => (
            <FormItem className="pt-4">
              <FormLabel>{t('resetPassword.password')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  error={!!error?.message}
                  autoComplete="new-password"
                  type={isPasswordShowFirst ? 'text' : 'password'}
                  afterClassName="cursor-pointer"
                  after={
                    isPasswordShowFirst ? (
                      <Eyeoff className="fill-gray-60" />
                    ) : (
                      <Eyeon className="fill-gray-60" />
                    )
                  }
                  afterProps={{
                    onClick: () => setIsPasswordShowFirst((prev) => !prev),
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>{t('resetPassword.confirmPassword')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  error={!!error?.message}
                  autoComplete="new-password"
                  type={isPasswordShowSecond ? 'text' : 'password'}
                  afterClassName="cursor-pointer"
                  after={
                    isPasswordShowSecond ? (
                      <Eyeoff className="fill-gray-60" />
                    ) : (
                      <Eyeon className="fill-gray-60" />
                    )
                  }
                  afterProps={{
                    onClick: () => setIsPasswordShowSecond((prev) => !prev),
                  }}
                />
              </FormControl>
              <FormMessage className="pt-0" />
            </FormItem>
          )}
        />

        <div className="flex h-full w-full items-end justify-between">
          <div className="flex h-14 items-center">
            <LinkTanstack
              id="to-signup-link"
              data-umami-event="to-signup-link"
              size="l"
              theme="brand"
              variant="hover"
              to="/signin"
            >
              {t('sign_in_button')}
            </LinkTanstack>
          </div>

          <Button
            variant="default"
            type="submit"
            loading={form.formState.isSubmitting}
            className="bg-brand-80 rounded-xl px-6 py-3"
          >
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
