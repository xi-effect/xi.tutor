import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
import { MaterialsAdd } from 'features.materials.add';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { FilesToolbar } from './Files/FilesToolbar';
import { MaterialsClassroomFilter } from './MaterialsClassroomFilter';
import { MaterialsScopeFilter } from './MaterialsScopeFilter';
import type { FilesFiltersT, MaterialScopeFilterT, MaterialsTabT } from '../types';

interface HeaderProps {
  activeTab: MaterialsTabT;
  onTabChange: (tabId: string) => void;
  scopeFilter: MaterialScopeFilterT;
  classroomIds: number[];
  onScopeChange: (scope: MaterialScopeFilterT) => void;
  onClassroomChange: (classroomIds: number[]) => void;
  filesFilters: FilesFiltersT;
  onFilesFiltersChange: (filters: FilesFiltersT) => void;
  onResetFilesFilters: () => void;
}

export const Header = ({
  activeTab,
  onTabChange,
  scopeFilter,
  classroomIds,
  onScopeChange,
  onClassroomChange,
  filesFilters,
  onFilesFiltersChange,
  onResetFilesFilters,
}: HeaderProps) => {
  const { t } = useTranslation('materials');

  const tabs = useMemo(
    () => [
      { id: 'boards', label: t('tabs.boards') },
      { id: 'notes', label: t('tabs.notes') },
      { id: 'files', label: t('tabs.files') },
    ],
    [t],
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="inline-flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col items-start justify-start gap-4 sm:flex-row sm:items-center sm:gap-10">
          <h1 className="font-playfair text-text-primary pb-2 text-3xl font-medium sm:text-5xl">
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

        <div
          className={cn(
            'items-center justify-start',
            activeTab === 'files' ? 'flex' : 'hidden sm:flex',
          )}
        >
          {activeTab === 'files' ? (
            <Button
              type="button"
              variant="primary"
              className="text-text-on-accent !h-auto gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium"
              onClick={() => toast(t('files.uploadSoon'))}
              data-umami-event="materials-files-upload"
            >
              <Plus className="fill-text-on-accent size-4 shrink-0" />
              {t('files.upload')}
            </Button>
          ) : (
            <MaterialsAdd onlyDrafts kind={activeTab === 'boards' ? 'board' : 'note'} />
          )}
        </div>
      </div>

      {activeTab === 'files' ? (
        <FilesToolbar
          filters={filesFilters}
          onChange={onFilesFiltersChange}
          onReset={onResetFilesFilters}
        />
      ) : (
        <div className="flex w-full shrink-0 flex-wrap items-start gap-2">
          <MaterialsScopeFilter value={scopeFilter} onChange={onScopeChange} />
          {scopeFilter === 'classroom' ? (
            <MaterialsClassroomFilter value={classroomIds} onChange={onClassroomChange} />
          ) : null}
        </div>
      )}
    </div>
  );
};
