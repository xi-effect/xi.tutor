import { Materials } from './Materials';
import { Notes } from './Notes';

type TabsComponentProps = {
  activeTab: 'notes' | 'boards';
};

export const TabsComponent = ({ activeTab }: TabsComponentProps) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {activeTab === 'boards' ? <Materials /> : <Notes />}
    </div>
  );
};
