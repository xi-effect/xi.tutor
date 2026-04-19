import { Tabs } from '@xipkg/tabs';
import { SwitcherAnimate } from '@xipkg/switcher-animate';

import { ClassroomScheduleProvider } from '../Calendar/ClassroomScheduleContext';
import { CalendarScheduleToolbar } from '../Calendar/ClassroomScheduleParts';
import { SharedTabsContent } from './SharedTabsContent';
import { useTabNavigation } from './useTabNavigation';

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
          <div className="bg-gray-0 mr-4 flex h-[56px] flex-row items-center gap-4 overflow-x-auto rounded-2xl px-2">
            <SwitcherAnimate
              tabs={tabs}
              activeTab={currentTab}
              onChange={handleTabChange}
              className="bg-gray-0 flex flex-row gap-0 max-sm:w-full"
              tabClassName="text-m-base font-medium text-gray-100"
            />
            {currentTab === 'schedule' && !isMobile && (
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <CalendarScheduleToolbar />
              </div>
            )}
          </div>

          <div className="bg-gray-0 flex min-h-0 min-w-0 flex-1 flex-col rounded-tl-2xl px-4 pt-0">
            <SharedTabsContent />
          </div>
        </Tabs.Root>
      </div>
    </ClassroomScheduleProvider>
  );
};
