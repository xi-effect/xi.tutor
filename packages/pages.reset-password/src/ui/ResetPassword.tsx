import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Link } from '@xipkg/link';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';

import { LinkTanstack, Logo } from 'common.ui';

import { usePasswordReset } from '../hooks';
import { FormDataEmail } from '../model/formSchemaEmail';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('resetPassword');

  const { form, onSubmit, isSubmitSuccessful, submittedEmail } = usePasswordReset();

  return (
    <Form<FormDataEmail> {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
        <div className="self-center">
          <Logo height={22} width={180} />
        </div>

        <h1 className="flex justify-center text-2xl font-semibold dark:text-gray-100">
          {isSubmitSuccessful ? t('emailSent') : t('title')}
        </h1>

        {isSubmitSuccessful ? (
          <div className="xs:w-[80%] m-auto w-full pt-4 text-center text-sm font-normal text-gray-100">
            {t('sentTo')} {submittedEmail}
          </div>
        ) : (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1 pt-4">
                <FormLabel className="text-sm font-normal">{t('emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    error={!!form.formState.errors.email}
                    autoComplete="email"
                    type="email"
                    {...field}
                    onChange={(e) => {
                      form.clearErrors('email');
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-80 pt-0 text-sm font-normal" />
              </FormItem>
            )}
          />
        )}

        <div className="flex h-full w-full items-end justify-between">
          <div className="flex h-[48px] items-center">
            {isSubmitSuccessful ? (
              <Link
                as="button"
                size="l"
                theme="brand"
                variant="hover"
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                {t('resend')}
              </Link>
            ) : (
              <LinkTanstack size="l" theme="brand" variant="hover" to="/signin">
                {t('sign_in_button')}
              </LinkTanstack>
            )}
          </div>

          {isSubmitSuccessful ? (
            <Button
              onClick={() => navigate({ to: '/signin' })}
              className="bg-brand-80 rounded-xl px-6 py-3"
            >
              {t('sign_in_button')}
            </Button>
          ) : (
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              className="bg-brand-80 rounded-xl px-6 py-3"
            >
              {t('send')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
