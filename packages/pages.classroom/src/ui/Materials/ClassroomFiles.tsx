import { type ReactNode, useMemo, useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { cn, useMediaQuery } from '@xipkg/utils';
import {
  useCurrentUser,
  useDetachClassroomFile,
  useGetClassroomFiles,
  useUploadClassroomFile,
  type LibraryFile,
} from 'common.services';
import {
  FileCard,
  FilePreviewModal,
  FilesFilteredEmpty,
  FilesTagsFilter,
  FilesTypeFilter,
  FilesUploaderFilter,
  DEFAULT_FILES_FILTERS,
  filterLibraryFiles,
  hasActiveFilesFilters,
  toLibraryFileSearchFilters,
  useParentScrollPagination,
  type FilesFiltersT,
} from 'pages.materials';
import { useTranslation } from 'react-i18next';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { galleryShadowHeaderInsetClass, galleryShadowPadClass } from '../galleryShadowClass';

type ClassroomFilesProps = {
  classroomId: string;
  heading: ReactNode;
};

export const ClassroomFiles = ({ classroomId, heading }: ClassroomFilesProps) => {
  const { t } = useTranslation('classroom');
  const { t: tMaterials } = useTranslation('materials');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;
  const [filters, setFilters] = useState<FilesFiltersT>(DEFAULT_FILES_FILTERS);
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const uploadMutation = useUploadClassroomFile();
  const detachMutation = useDetachClassroomFile();
  const filtersActive = hasActiveFilesFilters(filters);

  const { files, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetClassroomFiles({
      classroomId,
      isTutor,
      disabled: !classroomId || !roleReady,
      filters: toLibraryFileSearchFilters(filters),
    });

  const filteredFiles = useMemo(() => filterLibraryFiles(files, filters), [files, filters]);

  const currentPreviewFile = useMemo(() => {
    if (!previewFile) return null;
    return files.find((item) => item.id === previewFile.id) ?? previewFile;
  }, [files, previewFile]);

  const handleUpload = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    uploadMutation.mutate({ classroomId, file });
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
  };

  const handleDetach = (file: LibraryFile) => {
    detachMutation.mutate({ classroomId, fileId: file.id });
  };

  useParentScrollPagination({
    parentRef: listRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    itemsCount: filteredFiles.length,
  });

  const header = (
    <div className="shrink-0 pr-5 sm:pr-8 md:pr-10">
      <div
        className={cn(
          'flex min-w-0 flex-row flex-wrap items-center gap-3 sm:gap-4',
          galleryShadowHeaderInsetClass,
        )}
      >
        {heading}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {isTutor ? (
            <>
              <input
                ref={uploadInputRef}
                type="file"
                className="hidden"
                onChange={(event) => handleUpload(event.target.files)}
              />
              <Button
                type="button"
                variant="primary"
                size="s"
                className="rounded-[10px]"
                loading={uploadMutation.isPending}
                onClick={() => uploadInputRef.current?.click()}
                data-umami-event="classroom-files-upload"
              >
                {t('files.upload')}
              </Button>
            </>
          ) : null}
          <FilesUploaderFilter
            value={filters.uploader}
            onChange={(uploader) => setFilters((prev) => ({ ...prev, uploader }))}
          />
          <FilesTypeFilter
            value={filters.kinds}
            onChange={(kinds) => setFilters((prev) => ({ ...prev, kinds }))}
          />
          <FilesTagsFilter
            value={filters.tags}
            onChange={(tags) => setFilters((prev) => ({ ...prev, tags }))}
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
      </div>
    </div>
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

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="pr-5 pb-5 sm:pr-8 sm:pb-8 md:pr-10">
          <div className={galleryShadowPadClass}>
            {!files.length && !filtersActive ? (
              <EmptyDataState
                title={t('files.emptyTitle')}
                description={t('files.emptyDescription')}
              />
            ) : !filteredFiles.length ? (
              <FilesFilteredEmpty onReset={() => setFilters(DEFAULT_FILES_FILTERS)} />
            ) : (
              <>
                <div
                  className={cn(
                    'grid gap-5',
                    isMobile ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))]',
                  )}
                >
                  {filteredFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      className="h-44 w-full"
                      readOnly={!isTutor}
                      onRemoveFromClassroom={isTutor ? handleDetach : undefined}
                      onPreview={(nextFile) => {
                        window.setTimeout(() => setPreviewFile(nextFile), 0);
                      }}
                    />
                  ))}
                </div>
                <FilePreviewModal
                  file={currentPreviewFile}
                  files={filteredFiles}
                  readOnly={!isTutor}
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
                    isTutor ? (fileId) => detachMutation.mutate({ classroomId, fileId }) : undefined
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
      </div>
    </div>
  );
};
