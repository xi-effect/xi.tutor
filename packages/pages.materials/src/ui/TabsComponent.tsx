import { Tabs } from '@xipkg/tabs';
import { useEffect, useState } from 'react';

import { Materials } from './Materials';
import { Notes } from './Notes';
// import { Files } from './Files';

export const TabsComponent = () => {
  const getTabFromUrl = (): 'notes' | 'boards' => {
    if (typeof window === 'undefined') {
      return 'boards';
    }

    const tab = new URLSearchParams(window.location.search).get('tab');
    return tab === 'notes' || tab === 'boards' ? tab : 'boards';
  };
  const [currentTab, setCurrentTab] = useState<'notes' | 'boards'>(() => getTabFromUrl());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncTabFromUrl = () => {
      setCurrentTab(getTabFromUrl());
    };

    window.addEventListener('popstate', syncTabFromUrl);
    return () => {
      window.removeEventListener('popstate', syncTabFromUrl);
    };
  }, []);

  const handleTabChange = (value: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (value !== 'notes' && value !== 'boards') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url);
    setCurrentTab(value);
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
