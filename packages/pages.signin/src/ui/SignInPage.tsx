import { useEffect, useState } from 'react';
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
import type { UseFormSetError } from 'react-hook-form';

import { LinkTanstack, Logo } from 'common.ui';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getInviteAuthSearch,
  getInviteTrackingId,
  getOrCreateActivationFlowId,
  getPendingInviteCode,
  persistPendingInviteCode,
  shouldTrackInviteLoginClicked,
  shouldTrackInvitePageViewed,
  shouldTrackInviteSignupClicked,
  trackOnce,
  trackProductEvent,
  useGetUrlWithParams,
  useSyncAutofillOnSubmit,
} from 'common.utils';

import { FormData, useFormSchema } from '../model';
import { useSigninForm } from '../hooks';

export const SignInPage = () => {
  const { t } = useTranslation('signin');

  const formSchema = useFormSchema();
  const { onSigninForm, isPending, inviteUserNotFound } = useSigninForm();
  const getUrlWithParams = useGetUrlWithParams();

  const search = useSearch({ strict: false }) as { redirect?: string };
  const inviteCode = getPendingInviteCode(search);
  const isInviteRedirect = Boolean(inviteCode) || Boolean(search.redirect?.includes('/invite'));

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    formState: { errors },
  } = form;

  // Приведение типа из-за разных копий react-hook-form у @xipkg/form и в проекте
  const syncAutofillAndSubmit = useSyncAutofillOnSubmit(
    form as Parameters<typeof useSyncAutofillOnSubmit<FormData>>[0],
  );
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const changePasswordShow = () => setIsPasswordShow((prev) => !prev);

  // Fallback: прямой заход на /signin из invite-ссылки (старые закладки).
  // Основной page_viewed / login_clicked уходит со страницы /invite.
  useEffect(() => {
    if (!inviteCode) return;

    persistPendingInviteCode(inviteCode);
    const activationFlowId = getOrCreateActivationFlowId();

    void getInviteTrackingId(inviteCode).then((invite_tracking_id) => {
      if (shouldTrackInvitePageViewed(inviteCode)) {
        trackOnce(`student_invite_page_viewed:${inviteCode}`, () => {
          trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_PAGE_VIEWED, {
            invite_flow_version: 2,
            invite_tracking_id,
            activation_flow_id: activationFlowId,
          });
        });
      }

      if (shouldTrackInviteLoginClicked(inviteCode)) {
        trackOnce(`student_invite_login_clicked:${inviteCode}`, () => {
          trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_LOGIN_CLICKED, {
            invite_flow_version: 2,
            invite_tracking_id,
            source: 'invite',
            activation_flow_id: activationFlowId,
          });
        });
      }
    });
  }, [inviteCode]);

  const onSubmit = (data: FormData) => {
    onSigninForm(data, form.setError as UseFormSetError<FormData>);
  };

  const handleSignupLinkClick = () => {
    if (!isInviteRedirect) return;
    persistPendingInviteCode(inviteCode);

    if (inviteCode && !shouldTrackInviteSignupClicked(inviteCode)) return;

    void (async () => {
      const invite_tracking_id = inviteCode ? await getInviteTrackingId(inviteCode) : undefined;

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_SIGNUP_CLICKED, {
        invite_flow_version: 2,
        invite_tracking_id,
        source: 'invite',
        activation_flow_id: getOrCreateActivationFlowId(),
      });
    })();
  };

  const signupSearch = inviteCode ? getInviteAuthSearch(inviteCode) : undefined;
  const signupHref = signupSearch
    ? `/signup?redirect=${encodeURIComponent(signupSearch.redirect)}&invite=${encodeURIComponent(signupSearch.invite)}`
    : getUrlWithParams('/signup');

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center p-1 py-4">
      <div className="xs:border xs:border-border-default xs:rounded-2xl flex min-h-[600px] w-full max-w-[420px] flex-col bg-transparent p-8">
        <Form {...form}>
          <form onSubmit={syncAutofillAndSubmit(onSubmit)} className="flex flex-1 flex-col gap-4">
            <div className="self-center">
              <Logo height={22} width={180} />
            </div>
            <h1 className="text-text-primary flex justify-center text-2xl font-semibold">
              {t('sign_in')}
            </h1>

            {isInviteRedirect && (
              <div className="text-text-link bg-status-info-background rounded-2xl p-4 text-center text-sm whitespace-pre-line">
                {t('invite_message')}
              </div>
            )}

            {inviteUserNotFound && (
              <div className="border-border-default rounded-2xl border p-4 text-center">
                <p className="text-text-primary font-medium">{t('invite_user_not_found.title')}</p>
                <p className="text-text-secondary mt-1 text-sm">
                  {t('invite_user_not_found.hint')}
                </p>
                <div className="mt-3">
                  <LinkTanstack
                    size="l"
                    theme="brand"
                    variant="hover"
                    to={signupHref}
                    data-umami-event="auth-signup-link"
                    onClick={handleSignupLinkClick}
                  >
                    {t('invite_user_not_found.cta')}
                  </LinkTanstack>
                </div>
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
                          <Eyeoff className="fill-icon-secondary" />
                        ) : (
                          <Eyeon className="fill-icon-secondary" />
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

            <div className="mt-auto flex w-full items-end justify-between">
              <div className="flex h-[48px] items-center">
                <LinkTanstack
                  id="to-signup-link"
                  size="l"
                  theme="brand"
                  variant="hover"
                  to={signupHref}
                  data-umami-event="auth-signup-link"
                  onClick={handleSignupLinkClick}
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
