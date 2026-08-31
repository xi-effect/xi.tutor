import { useMemo } from 'react';
import { Tabs } from '@xipkg/tabs';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

import { CalendarScheduleToolbar } from '../Calendar/ClassroomScheduleParts';
import { SharedTabsContent } from './SharedTabsContent';
import { useTabNavigation } from './useTabNavigation';
import { ClassroomTabsBar } from './ClassroomTabsBar';

export const TabsStudent = () => {
  const { t } = useTranslation('classroom');
  const { isMobile, currentTab, handleTabChange } = useTabNavigation({
    normalizeMaterialTabs: true,
  });

  const tabs = useMemo(
    () => [
      { id: 'overview', label: t('tabs.overview') },
      { id: 'materials', label: t('tabs.materials') },
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
          extra={!isMobile && currentTab === 'schedule' ? <CalendarScheduleToolbar /> : undefined}
        />

        <div
          className={cn(
            'mt-4 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-5 sm:mt-6 sm:pl-8 md:pl-10',
            currentTab === 'overview' || currentTab === 'payments' || currentTab === 'materials'
              ? 'pr-0 pb-0'
              : 'pr-5 pb-5 sm:pr-8 sm:pb-8 md:pr-10',
            isMobile && 'pb-16',
          )}
        >
          <SharedTabsContent />
        </div>
      </Tabs.Root>
    </div>
  );
};
