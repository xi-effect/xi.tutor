import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import {
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
import type { HomeworkTab } from '../types';

type HeaderProps = {
  activeTab: HomeworkTab;
  onTabChange: (tabId: string) => void;
  onCreate: () => void;
};

export const Header = ({ activeTab, onTabChange, onCreate }: HeaderProps) => {
  const { t } = useTranslation('homework');

  const tabs = useMemo(
    () => [
      { id: 'active', label: t('tabs.active') },
      { id: 'templates', label: t('tabs.templates') },
      { id: 'archive', label: t('tabs.archive') },
    ],
    [t],
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="inline-flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col items-start justify-start gap-4 sm:flex-row sm:items-center sm:gap-10">
          <h1 className="font-playfair text-text-primary pb-2 text-2xl font-medium sm:text-4xl">
            {t('title')}
          </h1>

          <SwitcherAnimate
            tabs={tabs}
            activeTab={activeTab}
            onChange={onTabChange}
            className={pageSwitcherTrackClass}
            tabClassName={pageSwitcherTabClass}
            indicatorClassName={pageSwitcherIndicatorClass}
          />
        </div>

        <div className="flex items-center justify-start">
          <Button
            type="button"
            variant="primary"
            className="text-text-on-accent !h-auto gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium"
            onClick={onCreate}
            data-umami-event="homework-create-open"
          >
            <Plus className="fill-text-on-accent size-4 shrink-0" />
            {t('create')}
          </Button>
        </div>
      </div>
    </div>
  );
};
