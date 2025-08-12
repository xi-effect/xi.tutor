import React from 'react';
import { Link } from '@xipkg/link';
import { TelegramFilled, MailRounded } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
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
}: ErrorPagePropsT) => (
  <main
    className={cn(
      '3xl:px-[360px] flex h-full min-h-[100dvh] w-full flex-col justify-center gap-8 overflow-y-scroll px-8 md:px-[60px] lg:px-[120px]',
      withLogo && 'h-[100dvh] justify-between',
    )}
  >
    {withLogo && (
      <div className="flex h-[88px] min-h-[44px] items-end xl:h-[132px] xl:min-h-[52px]">
        <Logo />
      </div>
    )}
    <div className="flex flex-col justify-center">
      <span className="flex flex-col-reverse sm:flex-row sm:gap-1">
        <h1 className="text-gray-90 text-h3 sm:text-h2 mb-4 font-bold xl:text-[64px] xl:leading-[78px]">
          {title}
        </h1>
        <span className="text-gray-30 text-h6 xl:text-h3 font-bold">{errorCode}</span>
      </span>
      <p className="text-gray-90 text-l-base sm:text-xl-base mb-16 font-normal xl:text-[30px]">
        {text}
      </p>
      <p className="text-gray-80 text-m-base">
        Если ошибка повторяется — напишите <span className="hidden sm:inline">нам об этом</span>
        <span className="flex flex-col sm:flex-row">
          <span className="flex items-center">
            в&nbsp;
            <TelegramFilled className="fill-brand-80 mr-1" />
            <Link theme="brand" size="l" href="https://t.me/sovlium_support_bot" target="_blank">
              чат Telegram
            </Link>
          </span>
          <span className="flex items-center">
            &nbsp;или&nbsp;
            <MailRounded className="fill-brand-80 mr-1" />
            <Link theme="brand" size="l" href="mailto:support@sovlium.ru">
              на электронную почту
            </Link>
          </span>
        </span>
      </p>
      <p className="text-gray-80 text-m-base mt-16 flex flex-row gap-2">
        Вернитесь
        <LinkTanstack theme="brand" to="/">
          на главную
        </LinkTanstack>
      </p>
      <div className="text-gray-80 mt-[64px] text-[16px]">{children}</div>
    </div>
    <div className="h-[88px] min-h-[44px] xl:h-[132px] xl:min-h-[52px]" />
  </main>
);
