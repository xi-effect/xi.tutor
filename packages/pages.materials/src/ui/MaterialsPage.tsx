import { useEffect, useRef, useState } from 'react';

import { Header } from './Header';
import { MobileTutorActionButton } from 'features.invites';
import { TabsComponent } from './TabsComponent';
import { useCurrentUser } from 'common.services';
import { NotFoundPage } from 'common.ui';
import {
  MaterialsDuplicateProvider,
  useMaterialsDuplicate,
} from '../provider/MaterialsDuplicateContext';
import { LibraryTagsUiProvider } from './Files/tags/LibraryTagsUiContext';
import { useLibraryTags } from './Files/tags/useLibraryTags';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { cn, useMediaQuery } from '@xipkg/utils';
import {
  MaterialScopeFilterT,
  MaterialsTabT,
  DEFAULT_FILES_FILTERS,
  FilesFiltersT,
} from '../types';

const getTabFromUrl = (): MaterialsTabT => {
  if (typeof window === 'undefined') {
    return 'boards';
  }

  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab === 'notes' || tab === 'boards' || tab === 'files' ? tab : 'boards';
};

const getClassroomIdsFromUrl = (): number[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const classroom = new URLSearchParams(window.location.search).get('classroom');
  if (!classroom) {
    return [];
  }

  const ids = classroom
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  return [...new Set(ids)].sort((a, b) => a - b);
};

const getScopeFromUrl = (): MaterialScopeFilterT => {
  if (typeof window === 'undefined') {
    return 'personal';
  }

  const scope = new URLSearchParams(window.location.search).get('scope');
  if (scope === 'all' || scope === 'classroom' || scope === 'personal') {
    return scope;
  }

  return getClassroomIdsFromUrl().length > 0 ? 'classroom' : 'personal';
};

const replaceSearchParams = (updates: Record<string, string | null>) => {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  Object.entries(updates).forEach(([key, value]) => {
    if (value == null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  window.history.replaceState({}, '', url);
};

const MaterialsPageContent = () => {
  const [activeTab, setActiveTab] = useState<MaterialsTabT>(() => getTabFromUrl());
  const [scopeFilter, setScopeFilter] = useState<MaterialScopeFilterT>(() => getScopeFromUrl());
  const [classroomIds, setClassroomIds] = useState<number[]>(() =>
    getScopeFromUrl() === 'classroom' ? getClassroomIdsFromUrl() : [],
  );
  const [filesFilters, setFilesFilters] = useState<FilesFiltersT>(DEFAULT_FILES_FILTERS);
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { materialId, open, closeModal } = useMaterialsDuplicate();
  const { tags } = useLibraryTags();

  useEffect(() => {
    const validIds = new Set(tags.map((tag) => tag.id));
    setFilesFilters((current) => {
      const nextTags = current.tags.filter((tag) => validIds.has(tag.id));
      if (nextTags.length === current.tags.length) {
        return current;
      }

      return { ...current, tags: nextTags };
    });
  }, [tags]);

  useEffect(() => {
    const syncFromUrl = () => {
      const nextScope = getScopeFromUrl();
      setActiveTab(getTabFromUrl());
      setScopeFilter(nextScope);
      setClassroomIds(nextScope === 'classroom' ? getClassroomIdsFromUrl() : []);
    };

    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    if (tabId !== 'notes' && tabId !== 'boards' && tabId !== 'files') {
      return;
    }

    replaceSearchParams({ tab: tabId });
    setActiveTab(tabId);
  };

  const handleResetFilesFilters = () => {
    setFilesFilters(DEFAULT_FILES_FILTERS);
  };

  const handleScopeChange = (scope: MaterialScopeFilterT) => {
    replaceSearchParams({
      scope,
      classroom: null,
    });
    setScopeFilter(scope);
    setClassroomIds([]);
  };

  const handleClassroomChange = (nextClassroomIds: number[]) => {
    replaceSearchParams({
      classroom: nextClassroomIds.length > 0 ? nextClassroomIds.join(',') : null,
    });
    setClassroomIds(nextClassroomIds);
  };

  if (!isTutor) {
    return <NotFoundPage withLogo={false} />;
  }

  return (
    <>
      <div
        className={cn(
          'bg-background-page flex flex-col gap-4',
          isMobile ? 'max-h-[calc(100dvh-64px)]' : 'h-screen',
        )}
      >
        <div className="flex w-full shrink-0 items-start justify-between px-5 pt-4 sm:flex-row sm:px-8 sm:pt-8 md:px-10 md:pt-10">
          <Header
            activeTab={activeTab}
            onTabChange={handleTabChange}
            scopeFilter={scopeFilter}
            classroomIds={classroomIds}
            onScopeChange={handleScopeChange}
            onClassroomChange={handleClassroomChange}
            filesFilters={filesFilters}
            onFilesFiltersChange={setFilesFilters}
            onResetFilesFilters={handleResetFilesFilters}
          />
        </div>

        <div
          ref={parentRef}
          className={cn(
            'h-full overflow-y-auto px-5 pb-5 sm:mt-4 sm:pr-5 sm:pl-8 md:pr-8 md:pl-10',
            !isMobile && 'flex-1',
          )}
        >
          <TabsComponent
            activeTab={activeTab}
            scopeFilter={scopeFilter}
            classroomIds={classroomIds}
            parentRef={parentRef}
            filesFilters={filesFilters}
            onResetFilesFilters={handleResetFilesFilters}
          />
        </div>
      </div>

      <MobileTutorActionButton variant="materials" />

      {materialId !== null && (
        <MaterialsDuplicate
          materialId={materialId}
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              closeModal();
            }
          }}
        />
      )}
    </>
  );
};

export const MaterialsPage = () => {
  return (
    <MaterialsDuplicateProvider>
      <LibraryTagsUiProvider>
        <MaterialsPageContent />
      </LibraryTagsUiProvider>
    </MaterialsDuplicateProvider>
  );
};
