import { RefObject } from 'react';
import { Materials } from './Materials';
import { Notes } from './Notes';
import { MaterialScopeFilterT } from '../types';

type TabsComponentProps = {
  activeTab: 'notes' | 'boards';
  scopeFilter: MaterialScopeFilterT;
  classroomIds: number[];
  parentRef: RefObject<HTMLDivElement | null>;
};

export const TabsComponent = ({
  activeTab,
  scopeFilter,
  classroomIds,
  parentRef,
}: TabsComponentProps) => {
  return (
    <div>
      {activeTab === 'boards' ? (
        <Materials parentRef={parentRef} scopeFilter={scopeFilter} classroomIds={classroomIds} />
      ) : (
        <Notes parentRef={parentRef} scopeFilter={scopeFilter} classroomIds={classroomIds} />
      )}
    </div>
  );
};
