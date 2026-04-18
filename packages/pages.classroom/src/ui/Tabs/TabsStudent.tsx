/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tabs } from '@xipkg/tabs';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { useSearch, useNavigate } from '@tanstack/react-router';

import { Overview } from '../Overview';
import { SearchParams } from '../../types/router';
import { Payments } from '../Payments';
import { Calendar } from '../Calendar';
import { ClassroomScheduleProvider } from '../Calendar/ClassroomScheduleContext';
import { CalendarScheduleToolbar } from '../Calendar/ClassroomScheduleParts';
import { Materials } from '../Materials';
import { useMedia } from 'common.utils';

const tabs = [
  { id: 'overview', label: 'Сводка' },
  { id: 'materials', label: 'Материалы' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'payments', label: 'Оплаты' },
];

export const TabsStudent = () => {
  const isMobile = useMedia('(max-width: 720px)');
  const search: SearchParams = useSearch({ strict: false });
  const navigate = useNavigate();
  const currentTab = search.tab || 'overview';

  const handleTabChange = (value: string) => {
    // Сохраняем параметр call при смене табов
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      // @ts-ignore
      search: {
        // @ts-ignore
        tab: value === 'materials' ? 'boards' : value,
        ...filteredSearch,
      },
    });
  };

  return (
    <ClassroomScheduleProvider>
      <div className="bg-gray-0 h-[calc(100vh-88px)] rounded-tl-2xl px-4 pt-0">
        <Tabs.Root className="pt-2" value={currentTab} onValueChange={handleTabChange}>
          <div className="flex h-[56px] flex-row items-center gap-4 overflow-x-auto pr-4 pl-4 sm:p-0">
            <SwitcherAnimate
              tabs={tabs}
              activeTab={currentTab}
              onChange={handleTabChange}
              className="flex flex-row gap-4 max-sm:w-full"
              tabClassName="text-m-base font-medium text-gray-100"
            />
            {currentTab === 'schedule' && !isMobile && (
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <CalendarScheduleToolbar />
              </div>
            )}
          </div>
          <div className="pt-0">
            <Tabs.Content value="overview">
              <Overview />
            </Tabs.Content>

            <Tabs.Content value="materials">
              <Materials />
            </Tabs.Content>

            <Tabs.Content value="schedule">
              <Calendar />
            </Tabs.Content>

            <Tabs.Content value="payments">
              <Payments />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </ClassroomScheduleProvider>
  );
};
