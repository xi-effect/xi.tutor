import { Tabs } from '@xipkg/tabs';

import { Materials } from './Materials';
import { Notes } from './Notes';
interface TabsComponentProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabsComponent = ({ activeTab, onTabChange }: TabsComponentProps) => {
  return (
    <div className="bg-gray-0 h-[calc(100vh-72px)] w-full overflow-auto rounded-tl-2xl p-4 pr-4">
      <Tabs.Root value={activeTab} onValueChange={onTabChange}>
        <Tabs.Content className="mt-0" value="boards">
          <Materials />
        </Tabs.Content>

        <Tabs.Content className="mt-0" value="notes">
          <Notes />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
