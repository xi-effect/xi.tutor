import { Tabs } from '@xipkg/tabs';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { switcherTabClass } from 'common.ui';
import { cn } from '@xipkg/utils';

import { ClassroomScheduleProvider } from '../Calendar/ClassroomScheduleContext';
import { CalendarScheduleToolbar } from '../Calendar/ClassroomScheduleParts';
import { SharedTabsContent } from './SharedTabsContent';
import { useTabNavigation } from './useTabNavigation';
import { ClassroomMobileTabSwitcher } from './ClassroomMobileTabSwitcher';

const tabs = [
  { id: 'overview', label: 'Сводка' },
  { id: 'materials', label: 'Материалы' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'payments', label: 'Оплаты' },
];

export const TabsStudent = () => {
  const { isMobile, currentTab, handleTabChange } = useTabNavigation();

  return (
    <ClassroomScheduleProvider>
      <div className="flex h-[calc(100vh-80px)] min-h-0 min-w-0 flex-col">
        <Tabs.Root
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 pt-2"
          value={currentTab}
          onValueChange={handleTabChange}
        >
          <div className="bg-background-surface mr-4 flex h-[56px] flex-row items-center gap-4 rounded-2xl px-2">
            {isMobile ? (
              <ClassroomMobileTabSwitcher
                tabs={tabs}
                activeTab={currentTab}
                onChange={handleTabChange}
              />
            ) : (
              <>
                <SwitcherAnimate
                  tabs={tabs}
                  activeTab={currentTab}
                  onChange={handleTabChange}
                  className="bg-background-surface flex flex-row gap-0"
                  tabClassName={cn(switcherTabClass, 'text-m-base font-medium')}
                />
                {currentTab === 'schedule' && (
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <CalendarScheduleToolbar />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-background-surface xs:rounded-tl-2xl xs:pb-0 flex min-h-0 min-w-0 flex-1 flex-col rounded-none pt-0 pb-16 pl-4">
            <SharedTabsContent />
          </div>
        </Tabs.Root>
      </div>
    </ClassroomScheduleProvider>
  );
};
