import { RefObject } from 'react';
import { Materials } from './Materials';
import { Notes } from './Notes';
import { MaterialScopeFilterT } from '../types';

type TabsComponentProps = {
  activeTab: 'notes' | 'boards';
  scopeFilter: MaterialScopeFilterT;
  parentRef: RefObject<HTMLDivElement | null>;
};

export const TabsComponent = ({ activeTab, scopeFilter, parentRef }: TabsComponentProps) => {
  return (
    <div>
      {activeTab === 'boards' ? (
        <Materials parentRef={parentRef} scopeFilter={scopeFilter} />
      ) : (
        <Notes parentRef={parentRef} scopeFilter={scopeFilter} />
      )}
    </div>
  );
};
