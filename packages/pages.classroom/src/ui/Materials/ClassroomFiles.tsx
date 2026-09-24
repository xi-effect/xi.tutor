import { useMemo, useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { Plus } from '@xipkg/icons';
import { cn, useMediaQuery } from '@xipkg/utils';
import {
  useCurrentUser,
  useDetachClassroomFile,
  useGetClassroom,
  useGetClassroomFiles,
  type LibraryFile,
} from 'common.services';
import { isClassroomOnPause } from 'common.api';
import {
  FileCard,
  FilePreviewModal,
  FilesFilteredEmpty,
  FilesTagsFilter,
  FilesTypeFilter,
  FilesUploaderFilter,
  DEFAULT_FILES_FILTERS,
  UploadFilesModal,
  hasActiveFilesFilters,
  toLibraryFileSearchFilters,
  useParentScrollPagination,
  type FilesFiltersT,
} from 'pages.materials';
import { useTranslation } from 'react-i18next';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { useFitViewportHeight } from './useFitViewportHeight';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';

type ClassroomFilesProps = {
  classroomId: string;
  uploadOpen?: boolean;
  onUploadOpenChange?: (open: boolean) => void;
};

export const ClassroomFiles = ({
  classroomId,
  uploadOpen: uploadOpenProp,
  onUploadOpenChange,
}: ClassroomFilesProps) => {
  const { t } = useTranslation('classroom');
  const { t: tMaterials } = useTranslation('materials');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { data: classroom } = useGetClassroom(Number(classroomId), !isTutor);
  const isPaused = isClassroomOnPause(classroom?.status);
  const canUploadFiles = isTutor && !isPaused;
  const canRevokeFiles = isTutor;
  const roleReady = !isUserLoading && user != null;
  const [filters, setFilters] = useState<FilesFiltersT>(DEFAULT_FILES_FILTERS);
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null);
  const [internalUploadOpen, setInternalUploadOpen] = useState(false);
  const uploadOpen = onUploadOpenChange ? Boolean(uploadOpenProp) : internalUploadOpen;
  const setUploadOpen = onUploadOpenChange ?? setInternalUploadOpen;
  const listRef = useRef<HTMLDivElement>(null);
  const fitHeight = useFitViewportHeight(listRef, isMobile);
  const detachMutation = useDetachClassroomFile();
  const filtersActive = hasActiveFilesFilters(filters);

  const { files, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetClassroomFiles({
      classroomId,
      isTutor,
      disabled: !classroomId || !roleReady,
      filters: toLibraryFileSearchFilters(filters),
    });

  const currentPreviewFile = useMemo(() => {
    if (!previewFile) return null;
    return files.find((item) => item.id === previewFile.id) ?? previewFile;
  }, [files, previewFile]);

  const handleDetach = (file: LibraryFile) => {
    detachMutation.mutate({ classroomId, fileId: file.id });
  };

  useParentScrollPagination({
    parentRef: listRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    itemsCount: files.length,
  });

  const header = (
    <>
      <div className="shrink-0 pr-5 sm:pr-8 md:pr-10">
        <div
          className={cn(
            'flex min-w-0 flex-row flex-wrap items-center gap-3 sm:gap-4',
            galleryShadowHeaderInsetClass,
          )}
        >
          <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <FilesTagsFilter
                value={filters.tags}
                onChange={(tags) => setFilters((prev) => ({ ...prev, tags }))}
              />
              <FilesUploaderFilter
                value={filters.uploader}
                onChange={(uploader) => setFilters((prev) => ({ ...prev, uploader }))}
              />
              <FilesTypeFilter
                value={filters.kinds}
                onChange={(kinds) => setFilters((prev) => ({ ...prev, kinds }))}
              />
              {filtersActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-s-base text-text-link hover:text-text-link h-auto px-2 py-1 font-medium"
                  onClick={() => setFilters(DEFAULT_FILES_FILTERS)}
                >
                  {tMaterials('files.resetAll')}
                </Button>
              ) : null}
            </div>
            {canUploadFiles ? (
              <Button
                type="button"
                variant="primary"
                className="text-text-on-accent ml-auto hidden h-8! gap-2 rounded-[10px] px-4 font-medium min-[961px]:inline-flex"
                onClick={() => setUploadOpen(true)}
                data-umami-event="classroom-files-upload"
              >
                <Plus className="fill-text-on-accent size-4 shrink-0" />
                {tMaterials('files.upload')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {canUploadFiles ? (
        <UploadFilesModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          classroomId={classroomId}
        />
      ) : null}
    </>
  );

  if (!roleReady || isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 pt-2">
        {header}
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 pt-2">
        {header}
        <ErrorState />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pt-2">
      {header}

      {/* Скролл-контейнер = parentRef виртуализатора и пагинации по скроллу:
          GridVirtualizer — его прямой ребёнок с padding-top: 0. На планшетах/мобильных
          высоту считаем явно (fitHeight): flex-1 не вычитает fixed нижнюю панель. */}
      <div
        ref={listRef}
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-contain pr-3 pb-5 pl-2 sm:pr-6 sm:pb-8 md:pr-8',
        )}
        style={fitHeight != null ? { height: fitHeight, flex: 'none' } : undefined}
      >
        {!files.length && !filtersActive ? (
          <EmptyDataState title={t('files.emptyTitle')} description={t('files.emptyDescription')} />
        ) : !files.length ? (
          <FilesFilteredEmpty onReset={() => setFilters(DEFAULT_FILES_FILTERS)} />
        ) : (
          <>
            <GridVirtualizer
              parentRef={listRef}
              items={files}
              defaultRowHeight={176}
              minItemWidth={300}
              gap={20}
              maxColumns={4}
              isSingleColumn={isMobile}
              renderItem={(file) => (
                <FileCard
                  file={file}
                  className="w-full"
                  readOnly={!canUploadFiles}
                  onRemoveFromClassroom={canRevokeFiles ? handleDetach : undefined}
                  onPreview={(nextFile) => {
                    window.setTimeout(() => setPreviewFile(nextFile), 0);
                  }}
                />
              )}
            />
            <FilePreviewModal
              file={currentPreviewFile}
              files={files}
              readOnly={!canUploadFiles}
              hideLibraryActions
              contentSource={{ type: 'classroom', classroomId, isTutor }}
              deleteLabel={tMaterials('files.removeFromClassroom.confirm')}
              deleteTitle={tMaterials('files.removeFromClassroom.title')}
              deleteDescription={
                currentPreviewFile
                  ? tMaterials('files.removeFromClassroom.description', {
                      name: currentPreviewFile.name,
                    })
                  : undefined
              }
              onDeleteFile={
                canRevokeFiles
                  ? (fileId) => detachMutation.mutate({ classroomId, fileId })
                  : undefined
              }
              onFileChange={setPreviewFile}
              onOpenChange={(open) => {
                if (!open) setPreviewFile(null);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
