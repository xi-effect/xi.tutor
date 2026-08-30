import { useMemo, useState } from 'react';
import { cn, useMediaQuery } from '@xipkg/utils';
import { useCurrentUser, useGetClassroomFiles, type LibraryFile } from 'common.services';
import {
  FileCard,
  FilePreviewModal,
  FilesFilteredEmpty,
  LibraryTagsUiProvider,
  filterLibraryFiles,
  useLibraryTags,
  type FilesFiltersT,
} from 'pages.materials';
import { useTranslation } from 'react-i18next';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';

type ClassroomFilesProps = {
  classroomId: string;
  filters: FilesFiltersT;
  onResetFilters: () => void;
};

const ClassroomFilesGallery = ({ classroomId, filters, onResetFilters }: ClassroomFilesProps) => {
  const { t } = useTranslation('classroom');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null);
  const { fileTagIds } = useLibraryTags();

  const { files, isLoading, isError } = useGetClassroomFiles({
    classroomId,
    isTutor,
    disabled: !classroomId || !roleReady,
  });

  const filteredFiles = useMemo(
    () => filterLibraryFiles(files, filters, user?.id, fileTagIds),
    [fileTagIds, files, filters, user?.id],
  );

  const currentPreviewFile = useMemo(() => {
    if (!previewFile) return null;
    return files.find((item) => item.id === previewFile.id) ?? previewFile;
  }, [files, previewFile]);

  if (!roleReady || isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState />;
  }

  if (!files.length) {
    return (
      <EmptyDataState
        title={t('materials.noFiles')}
        description={t('materials.noFilesDescription')}
      />
    );
  }

  if (!filteredFiles.length) {
    return <FilesFilteredEmpty onReset={onResetFilters} />;
  }

  return (
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
        onFileChange={setPreviewFile}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      />
    </>
  );
};

export const ClassroomFiles = (props: ClassroomFilesProps) => (
  <LibraryTagsUiProvider>
    <ClassroomFilesGallery {...props} />
  </LibraryTagsUiProvider>
);
