import { Tabs } from '@xipkg/tabs';
import { SwitcherAnimate } from '@xipkg/switcher-animate';

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
          <div className="bg-gray-0 mr-4 flex h-[56px] flex-row items-center gap-4 rounded-2xl px-2">
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
                  className="bg-gray-0 flex flex-row gap-0"
                  tabClassName="text-m-base font-medium text-gray-100"
                />
                {currentTab === 'schedule' && (
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <CalendarScheduleToolbar />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-gray-0 xs:rounded-tl-2xl flex min-h-0 min-w-0 flex-1 flex-col rounded-none pt-0 pl-4">
            <SharedTabsContent />
          </div>
        </Tabs.Root>
      </div>
    </ClassroomScheduleProvider>
  );
};
