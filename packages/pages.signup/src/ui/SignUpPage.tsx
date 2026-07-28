import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseFormSetError } from 'react-hook-form';
import type { ZodType } from 'zod';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Checkbox } from '@xipkg/checkbox';
import { Link } from '@xipkg/link';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  useWatch,
} from '@xipkg/form';
import { Check, Eyeoff, Eyeon } from '@xipkg/icons';
import { cn } from '@xipkg/utils';

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

const successInputClassName =
  'border-status-success-accent hover:border-status-success-accent active:border-status-success-accent focus:border-status-success-accent dark:border-status-success-accent dark:hover:border-status-success-accent dark:active:border-status-success-accent dark:focus:border-status-success-accent';

const isFieldSuccess = (isTouched: boolean, hasError: boolean, schema: ZodType, value: unknown) =>
  isTouched && !hasError && schema.safeParse(value).success;

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
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      consent: false,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted, touchedFields },
  } = form;

  const watchedValues = useWatch({ control });
  const isFormValid = useMemo(
    () => formSchema.safeParse(watchedValues).success,
    [formSchema, watchedValues],
  );
  const isSubmitDisabled = isPending || !isFormValid;

  const isConsentInvalid = !!errors.consent && (isSubmitted || Boolean(touchedFields.consent));

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
    onSignupForm(
      {
        ...data,
        username: data.username.trim().toLowerCase(),
        email: data.email.trim().toLowerCase(),
      },
      form.setError as UseFormSetError<FormData>,
    );
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

    const firstInvalidField = (['username', 'email', 'password', 'consent'] as const).find(
      (name) => fieldErrors[name],
    );

    if (firstInvalidField) {
      form.setFocus(firstInvalidField);
    }
  };

  const [isPasswordShow, setIsPasswordShow] = useState(false);

  const changePasswordShow = () => {
    setIsPasswordShow((prev) => !prev);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formEl = e.currentTarget;

    // iOS Safari autofill: синхронизируем DOM → RHF перед валидацией
    for (const el of Array.from(formEl.elements)) {
      if (
        (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
        el.name &&
        (el.name === 'username' || el.name === 'email' || el.name === 'password')
      ) {
        setValue(el.name, el.value, { shouldValidate: false });
      }
    }

    handleSubmit(onSubmit, onInvalid)(e);
  };

  const linkBaseClass = 'xs:text-xxs-base text-[8px]';
  const linkErrorClass = isConsentInvalid
    ? 'text-text-danger dark:text-text-danger decoration-text-danger hover:text-text-danger hover:decoration-text-danger'
    : 'text-text-secondary';
  const consentTextClass = isConsentInvalid
    ? 'text-text-danger dark:text-text-danger'
    : 'text-text-secondary';

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center p-1 py-4">
      <div className="xs:border xs:border-border-default xs:rounded-2xl flex min-h-[600px] w-full max-w-[420px] flex-col bg-transparent p-8">
        <Form {...form}>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-1 flex-col space-y-4"
            aria-busy={isPending}
          >
            <div className="self-center">
              <Logo height={22} width={180} />
            </div>
            <h1 className="text-text-primary self-center text-2xl font-semibold">
              {t('register')}
            </h1>
            <FormField
              control={control}
              name="username"
              render={({ field, fieldState }) => {
                const isSuccess = isFieldSuccess(
                  fieldState.isTouched,
                  !!fieldState.error,
                  formSchema.shape.username,
                  field.value,
                );

                return (
                  <FormItem className="pt-4">
                    <FormLabel htmlFor="user name">{t('username')}</FormLabel>
                    <FormControl>
                      <Input
                        error={!!errors?.username}
                        autoComplete="username"
                        type="text"
                        id="user name"
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        className={cn(isSuccess && successInputClassName)}
                        after={
                          isSuccess ? (
                            <Check className="fill-status-success-text dark:fill-status-success-text size-5" />
                          ) : undefined
                        }
                        afterClassName={isSuccess ? 'pointer-events-none' : undefined}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value.toLowerCase());
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-text-secondary pt-0 text-xs">
                      {t('username_hint')}
                    </FormDescription>
                    <FormMessage className="pt-0" />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="email"
              render={({ field, fieldState }) => {
                const isSuccess = isFieldSuccess(
                  fieldState.isTouched,
                  !!fieldState.error,
                  formSchema.shape.email,
                  field.value,
                );

                return (
                  <FormItem>
                    <FormLabel htmlFor="user email">{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        error={!!errors?.email}
                        autoComplete="email"
                        type="email"
                        id="user email"
                        className={cn(isSuccess && successInputClassName)}
                        after={
                          isSuccess ? (
                            <Check className="fill-status-success-text dark:fill-status-success-text size-5" />
                          ) : undefined
                        }
                        afterClassName={isSuccess ? 'pointer-events-none' : undefined}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="pt-0" />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="password"
              render={({ field, fieldState }) => {
                const isSuccess = isFieldSuccess(
                  fieldState.isTouched,
                  !!fieldState.error,
                  formSchema.shape.password,
                  field.value,
                );

                return (
                  <FormItem>
                    <FormLabel htmlFor="user password">{t('password')}</FormLabel>
                    <FormControl>
                      <Input
                        error={!!errors?.password}
                        autoComplete="new-password"
                        id="user password"
                        type={isPasswordShow ? 'text' : 'password'}
                        className={cn(isSuccess && successInputClassName, isSuccess && 'pr-16')}
                        after={
                          <span className="flex items-center gap-1.5">
                            {isSuccess && (
                              <Check className="fill-status-success-text dark:fill-status-success-text pointer-events-none size-5" />
                            )}
                            <button
                              type="button"
                              onClick={changePasswordShow}
                              className="flex appearance-none items-center border-0 bg-transparent p-0"
                              tabIndex={-1}
                              aria-label={isPasswordShow ? 'Hide password' : 'Show password'}
                            >
                              {isPasswordShow ? (
                                <Eyeoff className="fill-icon-secondary" />
                              ) : (
                                <Eyeon className="fill-icon-secondary" />
                              )}
                            </button>
                          </span>
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="pt-0" />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="consent"
              render={({ field }) => (
                <FormItem className="pt-1">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(!!checked);
                        field.onBlur();
                      }}
                      onBlur={field.onBlur}
                      size="s"
                      state={isConsentInvalid ? 'error' : 'default'}
                      className={cn('xs:text-xxs-base gap-1.5 text-[8px]', consentTextClass)}
                      aria-invalid={isConsentInvalid}
                    >
                      {t('consent.prefix')}{' '}
                      <Link
                        size="s"
                        href="https://sovlium.ru/legal/terms"
                        target="_blank"
                        className={`${linkBaseClass} ${linkErrorClass}`}
                        data-umami-event="outbound-link-click"
                        data-umami-event-url="https://sovlium.ru/legal/terms"
                        data-umami-event-type="terms"
                      >
                        {t('consent.terms')}
                      </Link>{' '}
                      {t('consent.conjunction')}{' '}
                      <Link
                        size="s"
                        href="https://sovlium.ru/legal/privacy"
                        target="_blank"
                        className={`${linkBaseClass} ${linkErrorClass}`}
                        data-umami-event="outbound-link-click"
                        data-umami-event-url="https://sovlium.ru/legal/privacy"
                        data-umami-event-type="privacy"
                      >
                        {t('consent.privacy')}
                      </Link>
                    </Checkbox>
                  </FormControl>
                  <FormMessage className="pt-1" />
                </FormItem>
              )}
            />
            <div className="mt-auto flex w-full items-end justify-between">
              <div className="flex h-[48px] items-center">
                <LinkTanstack
                  size="l"
                  theme="brand"
                  variant="hover"
                  to="/signin"
                  data-umami-event="auth-signin-link"
                >
                  {t('sign_in')}
                </LinkTanstack>
              </div>
              {isPending ? (
                <Button
                  type="submit"
                  loading
                  className="w-[214px]"
                  disabled
                  aria-label={t('sign_up_loading')}
                />
              ) : (
                <Button
                  size="m"
                  variant="primary"
                  type="submit"
                  className="w-[214px]"
                  disabled={isSubmitDisabled}
                  data-umami-event="auth-signup-button"
                >
                  {t('sign_up')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
