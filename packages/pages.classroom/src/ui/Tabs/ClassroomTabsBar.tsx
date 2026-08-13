import { type ReactNode } from 'react';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import {
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
import { ClassroomBackButton } from './ClassroomBackButton';
import { ClassroomMobileTabSwitcher } from './ClassroomMobileTabSwitcher';

type ClassroomTab = {
  id: string;
  label: string;
};

type ClassroomTabsBarProps = {
  tabs: ClassroomTab[];
  currentTab: string;
  onChange: (tabId: string) => void;
  isMobile: boolean;
  extra?: ReactNode;
};

export const ClassroomTabsBar = ({
  tabs,
  currentTab,
  onChange,
  isMobile,
  extra,
}: ClassroomTabsBarProps) => (
  <div className="flex w-full shrink-0 items-center gap-3 px-5 sm:gap-4 sm:px-8 md:px-10">
    <ClassroomBackButton />
    {isMobile ? (
      <div className="min-w-0 flex-1">
        <ClassroomMobileTabSwitcher tabs={tabs} activeTab={currentTab} onChange={onChange} />
      </div>
    ) : (
      <SwitcherAnimate
        tabs={tabs}
        activeTab={currentTab}
        onChange={onChange}
        className={pageSwitcherTrackClass}
        tabClassName={pageSwitcherTabClass}
        indicatorClassName={pageSwitcherIndicatorClass}
      />
    )}
    {extra ? <div className="ml-auto flex shrink-0 items-center gap-2">{extra}</div> : null}
  </div>
);
