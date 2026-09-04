import { useMemo } from 'react';
import { Tabs } from '@xipkg/tabs';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

import { SharedTabsContent } from './SharedTabsContent';
import { isClassroomMaterialTab, useTabNavigation } from './useTabNavigation';
import { ClassroomTabsBar } from './ClassroomTabsBar';
import { NextLessonChip } from '../Header/NextLessonChip';

export const TabsStudent = () => {
  const { t } = useTranslation('classroom');
  const { isMobile, currentTab, handleTabChange } = useTabNavigation();

  const tabs = useMemo(
    () => [
      { id: 'boards', label: t('materials.boards') },
      { id: 'notes', label: t('materials.notes') },
      { id: 'files', label: t('materials.files') },
      { id: 'schedule', label: t('tabs.schedule') },
      { id: 'payments', label: t('tabs.payments') },
    ],
    [t],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs.Root
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        value={currentTab}
        onValueChange={handleTabChange}
      >
        <ClassroomTabsBar
          tabs={tabs}
          currentTab={currentTab}
          onChange={handleTabChange}
          isMobile={isMobile}
          extra={!isMobile ? <NextLessonChip /> : undefined}
        />

        <div
          className={cn(
            'mt-4 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-5 sm:mt-6 sm:pl-8 md:pl-10',
            currentTab === 'payments' || isClassroomMaterialTab(currentTab)
              ? 'pr-0 pb-0'
              : 'pr-5 pb-5 sm:pr-8 sm:pb-8 md:pr-10',
            isMobile && 'pb-20',
          )}
        >
          <SharedTabsContent currentTab={currentTab} />
        </div>
      </Tabs.Root>
    </div>
  );
};
