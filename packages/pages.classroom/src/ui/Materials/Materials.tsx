import { useState, type ReactNode } from 'react';
import { Button } from '@xipkg/button';
import { useParams, useSearch } from '@tanstack/react-router';
import { cn, useMediaQuery } from '@xipkg/utils';
import {
  useCurrentUser,
  useGetClassroom,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';
import { MaterialsCard } from 'features.materials.card';
import { MaterialsAdd } from 'features.materials.add';
import { useTranslation } from 'react-i18next';
import { ClassroomMaterialsT, YDocContentKind } from 'common.types';
import { FilesTagsFilter, LibraryTagsUiProvider, type FilesTagOptionT } from 'pages.materials';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { ClassroomFiles } from './ClassroomFiles';
import { galleryShadowHeaderInsetClass, galleryShadowPadClass } from '../galleryShadowClass';

type MaterialTypeTab = 'boards' | 'notes' | 'files';

const isMaterialTypeTab = (tab: unknown): tab is MaterialTypeTab =>
  tab === 'boards' || tab === 'notes' || tab === 'files';

const isYDocMaterial = (
  material: ClassroomMaterialsT,
): material is ClassroomMaterialsT & { content_kind: YDocContentKind } =>
  material.content_kind === 'note' || material.content_kind === 'board';

const ClassroomMaterialsGallery = () => {
  const { t } = useTranslation('classroom');
  const { t: tMaterials } = useTranslation('materials');
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const isMobile = useMediaQuery('(max-width: 960px)');
  const [materialTags, setMaterialTags] = useState<FilesTagOptionT[]>([]);
  const tagIds = materialTags.map((tag) => tag.id);

  const activeTab: MaterialTypeTab = isMaterialTypeTab(search.tab) ? search.tab : 'boards';
  const contentType = activeTab === 'notes' ? 'note' : 'board';

  const {
    data: classroom,
    isLoading: isClassroomLoading,
    isError: isClassroomError,
  } = useGetClassroom(Number(classroomId));

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;
  const documentsEnabled = Boolean(classroomId) && roleReady && activeTab !== 'files';

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

  const toolbar: ReactNode = (
    <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <FilesTagsFilter value={materialTags} onChange={setMaterialTags} />
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
      {isTutor && !isMobile ? (
        <div className="ml-auto shrink-0">
          <MaterialsAdd kind={activeTab === 'notes' ? 'note' : 'board'} />
        </div>
      ) : null}
    </div>
  );

  if (activeTab === 'files') {
    return <ClassroomFiles classroomId={classroomId} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pt-2">
      <div className="shrink-0 pr-5 sm:pr-8 md:pr-10">
        <div
          className={cn(
            'flex min-w-0 flex-row flex-wrap items-center gap-3 sm:gap-4',
            galleryShadowHeaderInsetClass,
          )}
        >
          {toolbar}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={cn('pr-5 pb-5 sm:pr-8 sm:pb-8 md:pr-10', isMobile && 'pb-20')}>
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
