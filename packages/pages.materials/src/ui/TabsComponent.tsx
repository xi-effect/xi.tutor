import { RefObject } from 'react';
import { Materials } from './Materials';
import { Notes } from './Notes';
import { Files } from './Files';
import type { FilesFiltersT, MaterialScopeFilterT, MaterialsTabT } from '../types';

type TabsComponentProps = {
  activeTab: MaterialsTabT;
  scopeFilter: MaterialScopeFilterT;
  classroomIds: number[];
  parentRef: RefObject<HTMLDivElement | null>;
  filesFilters: FilesFiltersT;
  onResetFilesFilters: () => void;
};

export const TabsComponent = ({
  activeTab,
  scopeFilter,
  classroomIds,
  parentRef,
  filesFilters,
  onResetFilesFilters,
}: TabsComponentProps) => {
  if (activeTab === 'files') {
    return (
      <Files parentRef={parentRef} filters={filesFilters} onResetFilters={onResetFilesFilters} />
    );
  }

  if (activeTab === 'boards') {
    return (
      <Materials parentRef={parentRef} scopeFilter={scopeFilter} classroomIds={classroomIds} />
    );
  }

  return <Notes parentRef={parentRef} scopeFilter={scopeFilter} classroomIds={classroomIds} />;
};
