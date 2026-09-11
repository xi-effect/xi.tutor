import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '@xipkg/button';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
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
import { isClassroomOnPause } from 'common.api';
import { FilesTagsFilter, LibraryTagsUiProvider, type FilesTagOptionT } from 'pages.materials';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { ClassroomFiles } from './ClassroomFiles';
import { useFitViewportHeight } from './useFitViewportHeight';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';

type MaterialTypeTab = 'boards' | 'notes' | 'files';

type MaterialsProps = {
  filesUploadOpen?: boolean;
  onFilesUploadOpenChange?: (open: boolean) => void;
};

const isMaterialTypeTab = (tab: unknown): tab is MaterialTypeTab =>
  tab === 'boards' || tab === 'notes' || tab === 'files';

const isYDocMaterial = (
  material: ClassroomMaterialsT,
): material is ClassroomMaterialsT & { content_kind: YDocContentKind } =>
  material.content_kind === 'note' || material.content_kind === 'board';

const ClassroomMaterialsGallery = ({
  filesUploadOpen,
  onFilesUploadOpenChange,
}: MaterialsProps) => {
  const { t } = useTranslation('classroom');
  const { t: tMaterials } = useTranslation('materials');
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const isMobile = useMediaQuery('(max-width: 960px)');
  const parentRef = useRef<HTMLDivElement>(null);
  const fitHeight = useFitViewportHeight(parentRef, isMobile);
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
  const isPaused = isClassroomOnPause(classroom?.status);
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

  const ydocMaterials = useMemo(() => materials?.filter(isYDocMaterial) ?? [], [materials]);

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
      {isTutor && !isMobile && !isPaused ? (
        <div className="ml-auto shrink-0">
          <MaterialsAdd kind={activeTab === 'notes' ? 'note' : 'board'} />
        </div>
      ) : null}
    </div>
  );

  if (activeTab === 'files') {
    return (
      <ClassroomFiles
        classroomId={classroomId}
        uploadOpen={filesUploadOpen}
        onUploadOpenChange={onFilesUploadOpenChange}
      />
    );
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

      {/* Скролл-контейнер = parentRef виртуализатора: GridVirtualizer должен быть его
          прямым ребёнком с padding-top: 0. На планшетах/мобильных высоту считаем явно
          (fitHeight), т.к. flex-1 не вычитает fixed нижнюю панель. */}
      <div
        ref={parentRef}
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-contain pr-3 pb-5 pl-2 sm:pr-6 sm:pb-8 md:pr-8',
        )}
        style={fitHeight != null ? { height: fitHeight, flex: 'none' } : undefined}
      >
        {isClassroomError || isMaterialsError || (!isClassroomLoading && !classroom) ? (
          <ErrorState />
        ) : isClassroomLoading || isMaterialsLoading || !roleReady ? (
          <LoadingState />
        ) : ydocMaterials.length === 0 ? (
          <EmptyDataState
            title={activeTab === 'boards' ? t('materials.noBoards') : t('materials.noNotes')}
            description={
              activeTab === 'boards'
                ? t('materials.noBoardsDescription')
                : t('materials.noNotesDescription')
            }
          />
        ) : (
          <GridVirtualizer
            parentRef={parentRef}
            items={ydocMaterials}
            defaultRowHeight={176}
            minItemWidth={300}
            gap={20}
            maxColumns={4}
            isSingleColumn={isMobile}
            renderItem={(material) => (
              <MaterialsCard {...material} layout="gallery" className="w-full" />
            )}
          />
        )}
      </div>
    </div>
  );
};

export const Materials = (props: MaterialsProps) => (
  <LibraryTagsUiProvider>
    <ClassroomMaterialsGallery {...props} />
  </LibraryTagsUiProvider>
);
