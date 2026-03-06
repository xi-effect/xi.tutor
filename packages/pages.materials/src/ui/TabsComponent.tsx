import { Tabs } from '@xipkg/tabs';

import { Materials } from './Materials';
import { Notes } from './Notes';
// import { Files } from './Files';

interface TabsComponentProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabsComponent = ({ activeTab, onTabChange }: TabsComponentProps) => {
  return (
    <div className="bg-gray-0 rounded-tl-2xl">
      <Tabs.Root value={activeTab} onValueChange={onTabChange}>
        <div className="h-[calc(100vh-88px)] pl-4">
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
    </div>
  );
};
