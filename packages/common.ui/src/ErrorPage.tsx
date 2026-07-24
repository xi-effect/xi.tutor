import React from 'react';
import { Link } from '@xipkg/link';
import { TelegramFilled, MailRounded } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { LinkTanstack } from './LinkTanstack';

export type ErrorPagePropsT = {
  title: string;
  errorCode: number;
  text: string;
  children?: React.ReactNode;
  withLogo?: boolean;
};

export const ErrorPage = ({
  title,
  errorCode,
  text,
  children,
  withLogo = true,
}: ErrorPagePropsT) => {
  const { t } = useTranslation('commonUi');

  return (
    <main
      className={cn(
        '3xl:px-[360px] flex h-full min-h-dvh w-full flex-col justify-center gap-8 overflow-y-scroll px-8 md:px-[60px] lg:px-[120px]',
        withLogo && 'h-dvh justify-between',
      )}
    >
      {withLogo && (
        <div className="flex h-[88px] min-h-[44px] items-end xl:h-[132px] xl:min-h-[52px]">
          <Logo />
        </div>
      )}
      <div className="flex flex-col justify-center">
        <span className="flex flex-col-reverse sm:flex-row sm:gap-1">
          <h1 className="text-text-primary text-h3 sm:text-h2 mb-4 font-bold xl:text-[64px] xl:leading-[78px]">
            {title}
          </h1>
          <span className="text-text-disabled text-h6 xl:text-h3 font-bold">{errorCode}</span>
        </span>
        <p className="text-text-primary text-l-base sm:text-xl-base mb-16 font-normal xl:text-[30px]">
          {text}
        </p>
        <p className="text-text-primary text-m-base">
          {t('errorPage.ifErrorRepeats')}{' '}
          <span className="hidden sm:inline">{t('errorPage.aboutIt')}</span>
          <span className="flex flex-col sm:flex-row">
            <span className="flex items-center">
              {t('errorPage.in')}&nbsp;
              <TelegramFilled className="fill-icon-brand mr-1" />
              <Link
                theme="brand"
                size="l"
                href="https://t.me/sovlium_support_bot"
                target="_blank"
                data-umami-event="outbound-link-click"
                data-umami-event-url="https://t.me/sovlium_support_bot"
                data-umami-event-type="support-telegram"
              >
                {t('errorPage.telegramChat')}
              </Link>
            </span>
            <span className="flex items-center">
              &nbsp;{t('errorPage.or')}&nbsp;
              <MailRounded className="fill-icon-brand mr-1" />
              <Link
                theme="brand"
                size="l"
                href="mailto:support@sovlium.ru"
                data-umami-event="outbound-link-click"
                data-umami-event-url="mailto:support@sovlium.ru"
                data-umami-event-type="support-email"
              >
                {t('errorPage.email')}
              </Link>
            </span>
          </span>
        </p>
        <p className="text-text-primary text-m-base mt-16 flex flex-row gap-2">
          {t('errorPage.return')}
          <LinkTanstack theme="brand" to="/" data-umami-event="error-page-home-link">
            {t('errorPage.toHome')}
          </LinkTanstack>
        </p>
        <div className="text-text-primary mt-[64px] text-[16px]">{children}</div>
      </div>
      <div className="h-[88px] min-h-[44px] xl:h-[132px] xl:min-h-[52px]" />
    </main>
  );
};
