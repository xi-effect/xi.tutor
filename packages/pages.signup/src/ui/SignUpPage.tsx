import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Checkbox } from '@xipkg/checkbox';
import { Link } from '@xipkg/link';
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

import { useFormSchema, type FormData } from '../model';
import { useSignupForm } from '../hooks';
import { LinkTanstack, Logo } from 'common.ui';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getOrCreateActivationFlowId,
  inferSignupEntryPoint,
  mapSignupValidationErrors,
  trackOnce,
  trackProductEvent,
} from 'common.utils';

export const SignUpPage = () => {
  const { t } = useTranslation('signup');
  const search = useSearch({ strict: false }) as {
    redirect?: string;
    invite?: string;
    from?: string;
  };

  const formSchema = useFormSchema();
  const { onSignupForm, isPending } = useSignupForm();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = form;

  const isConsentInvalid = isSubmitted && !!errors.consent;

  const entryPoint = inferSignupEntryPoint(search);
  const hasInvite = Boolean(search.invite) || entryPoint === 'invite';

  useEffect(() => {
    const activationFlowId = getOrCreateActivationFlowId();

    trackOnce('auth_signup_viewed', () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNUP_VIEWED, {
        activation_flow_id: activationFlowId,
        entry_point: entryPoint,
        has_invite: hasInvite,
      });
    });
  }, [entryPoint, hasInvite]);

  const onSubmit = (data: FormData) => {
    onSignupForm(data);
  };

  const onInvalid = (fieldErrors: typeof errors) => {
    const { reason, field } = mapSignupValidationErrors(fieldErrors);
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNUP_VALIDATION_FAILED, {
      activation_flow_id: getOrCreateActivationFlowId(),
      reason,
      field,
      entry_point: entryPoint,
      has_invite: hasInvite,
    });
  };

  const [isPasswordShow, setIsPasswordShow] = useState(false);

  const changePasswordShow = () => {
    setIsPasswordShow((prev) => !prev);
  };

  const getSigninHref = () => {
    return '/signin';
  };

  const linkBaseClass = 'xs:text-xxs-base text-[8px]';
  const linkErrorClass = isConsentInvalid
    ? 'text-red-80 dark:text-red-40 decoration-red-40 hover:text-red-80 hover:decoration-red-80'
    : 'text-gray-60';

  const isButtonDisabled = isPending;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center p-1 py-4">
      <div className="xs:border xs:border-gray-10 xs:rounded-2xl flex min-h-[600px] w-full max-w-[420px] flex-col bg-transparent p-8">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="flex flex-1 flex-col space-y-4"
          >
            <div className="self-center">
              <Logo height={22} width={180} />
            </div>
            <h1 className="self-center text-2xl font-semibold text-gray-100">{t('register')}</h1>
            <FormField
              control={control}
              name="username"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="pt-4">
                  <FormLabel htmlFor="user name">{t('username')}</FormLabel>
                  <FormControl>
                    <Input
                      error={!!errors?.username}
                      autoComplete="off"
                      type="text"
                      id="user name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="pt-0" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="email"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="user email">{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      error={!!errors?.email}
                      autoComplete="on"
                      type="email"
                      id="user email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="pt-0" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="password"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="user password">{t('password')}</FormLabel>
                  <FormControl>
                    <Input
                      error={!!errors?.password}
                      autoComplete="on"
                      id="user password"
                      type={isPasswordShow ? 'text' : 'password'}
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
            <FormField
              control={control}
              name="consent"
              defaultValue={false}
              render={({ field }) => (
                <FormItem className="pt-1">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      size="s"
                      className="xs:text-xxs-base text-gray-60 gap-1.5 text-[8px]"
                      checkboxStyles={
                        isConsentInvalid ? 'border border-red-80 hover:border-red-80' : ''
                      }
                    >
                      Нажимая Создать аккаунт, вы принимаете условия <br />
                      <Link
                        size="s"
                        href="https://sovlium.ru/legal/terms"
                        target="_blank"
                        className={`${linkBaseClass} ${linkErrorClass}`}
                        data-umami-event="outbound-link-click"
                        data-umami-event-url="https://sovlium.ru/legal/terms"
                        data-umami-event-type="terms"
                      >
                        пользовательского соглашения
                      </Link>{' '}
                      и{' '}
                      <Link
                        size="s"
                        href="https://sovlium.ru/legal/privacy"
                        target="_blank"
                        className={`${linkBaseClass} ${linkErrorClass}`}
                        data-umami-event="outbound-link-click"
                        data-umami-event-url="https://sovlium.ru/legal/privacy"
                        data-umami-event-type="privacy"
                      >
                        политики конфиденциальности
                      </Link>
                    </Checkbox>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-auto flex w-full items-end justify-between">
              <div className="flex h-[48px] items-center">
                <LinkTanstack
                  size="l"
                  theme="brand"
                  variant="hover"
                  to={getSigninHref()}
                  data-umami-event="auth-signin-link"
                >
                  {t('sign_in')}
                </LinkTanstack>
              </div>
              {!isButtonDisabled ? (
                <Button
                  size="m"
                  variant="primary"
                  type="submit"
                  className="w-[214px]"
                  disabled={isButtonDisabled}
                  data-umami-event="auth-signup-button"
                >
                  {t('sign_up')}
                </Button>
              ) : (
                <Button loading className="w-[214px]" disabled />
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
