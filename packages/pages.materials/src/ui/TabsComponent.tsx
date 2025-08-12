import { Tabs } from '@xipkg/tabs';

import { Materials } from './Materials';
import { Notes } from './Notes';
// import { Files } from './Files';

export const TabsComponent = () => {
  return (
    <Tabs.Root defaultValue="boards">
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
