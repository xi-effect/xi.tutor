import { useMemo, useState } from 'react';
import { Button } from '@xipkg/button';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { cn, useMediaQuery } from '@xipkg/utils';
import {
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
import {
  useCurrentUser,
  useGetClassroom,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';
import { MaterialsCard } from 'features.materials.card';
import { useTranslation } from 'react-i18next';
import { ClassroomMaterialsT, YDocContentKind } from 'common.types';
import { FilesTagsFilter, LibraryTagsUiProvider, type FilesTagOptionT } from 'pages.materials';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { galleryShadowHeaderInsetClass, galleryShadowPadClass } from '../galleryShadowClass';
import { sectionTitleClass } from '../sectionTitleClass';

type MaterialTypeTab = 'boards' | 'notes';

const isMaterialTypeTab = (tab: unknown): tab is MaterialTypeTab =>
  tab === 'boards' || tab === 'notes';

const isYDocMaterial = (
  material: ClassroomMaterialsT,
): material is ClassroomMaterialsT & { content_kind: YDocContentKind } =>
  material.content_kind === 'note' || material.content_kind === 'board';

const ClassroomMaterialsGallery = () => {
  const { t } = useTranslation('classroom');
  const { t: tMaterials } = useTranslation('materials');
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 960px)');
  const [materialTags, setMaterialTags] = useState<FilesTagOptionT[]>([]);
  const tagIds = materialTags.map((tag) => Number(tag.id)).filter(Number.isFinite);

  const activeTab: MaterialTypeTab = isMaterialTypeTab(search.tab) ? search.tab : 'boards';
  const contentType = activeTab === 'notes' ? 'note' : 'board';

  const typeTabs = useMemo(
    () => [
      { id: 'boards', label: t('materials.boards') },
      { id: 'notes', label: t('materials.notes') },
    ],
    [t],
  );

  const {
    data: classroom,
    isLoading: isClassroomLoading,
    isError: isClassroomError,
  } = useGetClassroom(Number(classroomId));

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;
  const documentsEnabled = Boolean(classroomId) && roleReady;

  const tutorList = useGetClassroomMaterialsList({
    classroomId: classroomId || '',
    content_kind: contentType,
    tag_ids: tagIds,
    disabled: !documentsEnabled || !isTutor,
  });
  const studentList = useGetClassroomMaterialsListStudent({
    classroomId: classroomId || '',
    content_kind: contentType,
    tag_ids: tagIds,
    disabled: !documentsEnabled || isTutor,
  });

  const {
    data: materials,
    isLoading: isMaterialsLoading,
    isError: isMaterialsError,
  } = isTutor ? tutorList : studentList;

  const handleTypeChange = (tabId: string) => {
    if (!isMaterialTypeTab(tabId)) return;
    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId },
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        tab: tabId,
      }),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pt-2">
      <div className="shrink-0 pr-5 sm:pr-8 md:pr-10">
        <div
          className={cn(
            'flex min-w-0 flex-row flex-wrap items-center gap-3 sm:gap-4',
            galleryShadowHeaderInsetClass,
          )}
        >
          <h2 className={sectionTitleClass}>{t('tabs.materials')}</h2>
          <SwitcherAnimate
            tabs={typeTabs}
            activeTab={activeTab}
            onChange={handleTypeChange}
            className={cn(pageSwitcherTrackClass, 'w-auto')}
            tabClassName={pageSwitcherTabClass}
            indicatorClassName={pageSwitcherIndicatorClass}
          />
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <FilesTagsFilter value={materialTags} onChange={setMaterialTags} maxCount={5} />
            {materialTags.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                className="text-s-base text-text-link hover:text-text-link h-auto px-2 py-1 font-medium"
                onClick={() => setMaterialTags([])}
              >
                {tMaterials('files.resetAll')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="pr-5 pb-5 sm:pr-8 sm:pb-8 md:pr-10">
          <div className={galleryShadowPadClass}>
            {isClassroomError || isMaterialsError || (!isClassroomLoading && !classroom) ? (
              <ErrorState />
            ) : isClassroomLoading || isMaterialsLoading || !roleReady ? (
              <LoadingState />
            ) : !materials?.length ? (
              <EmptyDataState
                title={activeTab === 'boards' ? t('materials.noBoards') : t('materials.noNotes')}
                description={
                  activeTab === 'boards'
                    ? t('materials.noBoardsDescription')
                    : t('materials.noNotesDescription')
                }
              />
            ) : (
              <div
                className={cn(
                  'grid gap-5',
                  isMobile ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))]',
                )}
              >
                {materials.filter(isYDocMaterial).map((material) => (
                  <MaterialsCard
                    key={material.id}
                    {...material}
                    layout="gallery"
                    className="h-44 w-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Materials = () => (
  <LibraryTagsUiProvider>
    <ClassroomMaterialsGallery />
  </LibraryTagsUiProvider>
);
