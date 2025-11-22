import { ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import { ScrollArea } from '@xipkg/scrollarea';

import { DayCalendar } from './DayCalendar';
import type { FC, PropsWithChildren } from 'react';

interface ModalContentWrapperProps extends PropsWithChildren {
  className?: string;
  currentDay: Date;
}

const ModalContentDesktop: FC<ModalContentWrapperProps> = ({ children, currentDay, className }) => {
  return (
    <div className={cn('flex justify-between gap-8', className)}>
      <div className="w-full">
        <DayCalendar day={currentDay} />
      </div>
      <div className="w-full">
        <ModalTitle className="mb-4 p-0 dark:text-gray-100">Назначение занятия</ModalTitle>
        {children}
      </div>
    </div>
  );
};

const ModalContentMobile: FC<ModalContentWrapperProps> = ({ children, currentDay, className }) => {
  return (
    <div className={className}>
      <ModalTitle className="mb-4 p-0 dark:text-gray-100">Назначение занятия</ModalTitle>
      <div className="flex h-full flex-col gap-8">
        <div className="h-[15%] w-full">
          <DayCalendar day={currentDay} />
        </div>
        <div className="h-[25%] w-full">
          <ScrollArea className="h-full">{children}</ScrollArea>
        </div>
      </div>
    </div>
  );
};

export const ModalContentWrapper: FC<ModalContentWrapperProps> = ({ children, currentDay }) => {
  return (
    <>
      <ModalContentDesktop children={children} currentDay={currentDay} className="hidden sm:flex" />
      <ModalContentMobile
        children={children}
        currentDay={currentDay}
        className="block h-full sm:hidden"
      />
    </>
  );
};
