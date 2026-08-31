import { useMemo, useRef, useState } from 'react';
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
  LibraryTagsUiProvider,
  DEFAULT_FILES_FILTERS,
  filterLibraryFiles,
  hasActiveFilesFilters,
  toLibraryFileSearchFilters,
  useLibraryTags,
  type FilesFiltersT,
} from 'pages.materials';
import { useTranslation } from 'react-i18next';
import { EmptyDataState } from '../Materials/components/EmptyDataState';
import { ErrorState } from '../Materials/components/ErrorState';
import { LoadingState } from '../Materials/components/LoadingState';
import { galleryShadowHeaderInsetClass, galleryShadowPadClass } from '../galleryShadowClass';
import { sectionTitleClass } from '../sectionTitleClass';
import { AddLibraryFileToClassroomModal } from './AddLibraryFileToClassroomModal';

type ClassroomFilesPageProps = {
  classroomId: string;
};

const ClassroomFilesGallery = ({ classroomId }: ClassroomFilesPageProps) => {
  const { t } = useTranslation('classroom');
  const { t: tMaterials } = useTranslation('materials');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;
  const [filters, setFilters] = useState<FilesFiltersT>(DEFAULT_FILES_FILTERS);
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { fileTagIds } = useLibraryTags();
  const uploadMutation = useUploadClassroomFile();
  const detachMutation = useDetachClassroomFile();
  const filtersActive = hasActiveFilesFilters(filters);

  const { files, isLoading, isError } = useGetClassroomFiles({
    classroomId,
    isTutor,
    disabled: !classroomId || !roleReady,
    filters: toLibraryFileSearchFilters(filters),
  });

  const filteredFiles = useMemo(
    () => filterLibraryFiles(files, filters, user?.id, fileTagIds),
    [fileTagIds, files, filters, user?.id],
  );

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

  if (!roleReady || isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState />;
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
          <h2 className={sectionTitleClass}>{t('tabs.files')}</h2>
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
                <Button
                  type="button"
                  variant="ghost"
                  size="s"
                  className="rounded-[10px]"
                  onClick={() => setLibraryOpen(true)}
                  data-umami-event="classroom-files-add-from-library"
                >
                  {t('files.addFromLibrary')}
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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

      {isTutor ? (
        <AddLibraryFileToClassroomModal
          classroomId={classroomId}
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
        />
      ) : null}
    </div>
  );
};

export const ClassroomFilesPage = (props: ClassroomFilesPageProps) => (
  <LibraryTagsUiProvider>
    <ClassroomFilesGallery {...props} />
  </LibraryTagsUiProvider>
);
