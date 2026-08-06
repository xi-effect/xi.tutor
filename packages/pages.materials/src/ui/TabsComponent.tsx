import { Materials } from './Materials';
import { Notes } from './Notes';

type TabsComponentProps = {
  activeTab: 'notes' | 'boards';
};

export const TabsComponent = ({ activeTab }: TabsComponentProps) => {
  return <div>{activeTab === 'boards' ? <Materials /> : <Notes />}</div>;
};
