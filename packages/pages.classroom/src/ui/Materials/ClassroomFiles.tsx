import { useState } from 'react';
import { cn, useMediaQuery } from '@xipkg/utils';
import { useCurrentUser, useGetClassroomFiles, type LibraryFile } from 'common.services';
import { FileCard, FilePreviewModal, LibraryTagsUiProvider } from 'pages.materials';
import { useTranslation } from 'react-i18next';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';

type ClassroomFilesProps = {
  classroomId: string;
};

const ClassroomFilesGallery = ({ classroomId }: ClassroomFilesProps) => {
  const { t } = useTranslation('classroom');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null);

  const { files, isLoading, isError } = useGetClassroomFiles({
    classroomId,
    isTutor,
    disabled: !classroomId || !roleReady,
  });

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

  return (
    <>
      <div
        className={cn(
          'grid gap-5',
          isMobile ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))]',
        )}
      >
        {files.map((file) => (
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
        file={previewFile}
        files={files}
        readOnly={!isTutor}
        onFileChange={setPreviewFile}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      />
    </>
  );
};

export const ClassroomFiles = ({ classroomId }: ClassroomFilesProps) => (
  <LibraryTagsUiProvider>
    <ClassroomFilesGallery classroomId={classroomId} />
  </LibraryTagsUiProvider>
);
