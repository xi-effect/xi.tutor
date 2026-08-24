import { RefObject } from 'react';
import { Materials } from './Materials';
import { Notes } from './Notes';
import { MaterialScopeFilterT } from '../types';

type TabsComponentProps = {
  activeTab: 'notes' | 'boards';
  scopeFilter: MaterialScopeFilterT;
  classroomId: number | null;
  parentRef: RefObject<HTMLDivElement | null>;
};

export const TabsComponent = ({
  activeTab,
  scopeFilter,
  classroomId,
  parentRef,
}: TabsComponentProps) => {
  return (
    <div>
      {activeTab === 'boards' ? (
        <Materials parentRef={parentRef} scopeFilter={scopeFilter} classroomId={classroomId} />
      ) : (
        <Notes parentRef={parentRef} scopeFilter={scopeFilter} classroomId={classroomId} />
      )}
    </div>
  );
};
