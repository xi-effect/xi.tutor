import { RefObject } from 'react';
import { Materials } from './Materials';
import { Notes } from './Notes';

type TabsComponentProps = {
  activeTab: 'notes' | 'boards';
  parentRef: RefObject<HTMLDivElement | null>;
};

export const TabsComponent = ({ activeTab, parentRef }: TabsComponentProps) => {
  return (
    <div>
      {activeTab === 'boards' ? (
        <Materials parentRef={parentRef} />
      ) : (
        <Notes parentRef={parentRef} />
      )}
    </div>
  );
};
