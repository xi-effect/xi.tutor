import { Materials } from './Materials';
import { Notes } from './Notes';

type TabsComponentProps = {
  activeTab: 'notes' | 'boards';
};

export const TabsComponent = ({ activeTab }: TabsComponentProps) => {
  return <div className="h-full min-h-0">{activeTab === 'boards' ? <Materials /> : <Notes />}</div>;
};
