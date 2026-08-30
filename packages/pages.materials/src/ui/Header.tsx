import { SwitcherAnimate } from '@xipkg/switcher-animate';
import {
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
import { MaterialsAdd } from 'features.materials.add';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { MaterialScopeFilterT } from '../types';
import { MaterialsClassroomFilter } from './MaterialsClassroomFilter';
import { MaterialsScopeFilter } from './MaterialsScopeFilter';

interface HeaderProps {
  activeTab: 'notes' | 'boards';
  onTabChange: (tabId: string) => void;
  scopeFilter: MaterialScopeFilterT;
  classroomIds: number[];
  onScopeChange: (scope: MaterialScopeFilterT) => void;
  onClassroomChange: (classroomIds: number[]) => void;
}

export const Header = ({
  activeTab,
  onTabChange,
  scopeFilter,
  classroomIds,
  onScopeChange,
  onClassroomChange,
}: HeaderProps) => {
  const { t } = useTranslation('materials');

  const tabs = useMemo(
    () => [
      { id: 'boards', label: t('tabs.boards') },
      { id: 'notes', label: t('tabs.notes') },
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

        <div className="hidden items-center justify-start sm:flex">
          <MaterialsAdd onlyDrafts kind={activeTab === 'boards' ? 'board' : 'note'} />
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-wrap items-start gap-2">
        <MaterialsScopeFilter value={scopeFilter} onChange={onScopeChange} />
        {scopeFilter === 'classroom' ? (
          <MaterialsClassroomFilter value={classroomIds} onChange={onClassroomChange} />
        ) : null}
      </div>
    </div>
  );
};
