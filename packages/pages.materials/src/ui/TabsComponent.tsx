/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tabs } from '@xipkg/tabs';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { Materials } from './Materials';
import { Notes } from './Notes';
// import { Files } from './Files';

export const TabsComponent = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const currentTab =
    search.tab === 'notes' || search.tab === 'boards'
      ? (search.tab as 'notes' | 'boards')
      : 'boards';

  const handleTabChange = (value: string) => {
    navigate({
      // @ts-ignore
      search: {
        ...search,
        // @ts-ignore
        tab: value,
      },
      replace: true,
    });
  };

  return (
    <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
      <Tabs.List className="flex w-70 flex-row gap-4">
        <Tabs.Trigger value="boards" className="text-m-base font-medium text-gray-100">
          Учебные доски
        </Tabs.Trigger>

        <Tabs.Trigger value="notes" className="text-m-base font-medium text-gray-100">
          Заметки
        </Tabs.Trigger>

        {/* <Tabs.Trigger value="files" className="text-m-base font-medium text-gray-100">
          Файлы
        </Tabs.Trigger> */}
      </Tabs.List>

      <div className="pt-0">
        <Tabs.Content value="boards">
          <Materials />
        </Tabs.Content>

        <Tabs.Content value="notes">
          <Notes />
        </Tabs.Content>

        {/* <Tabs.Content value="files">
          <Files />
        </Tabs.Content> */}
      </div>
    </Tabs.Root>
  );
};
