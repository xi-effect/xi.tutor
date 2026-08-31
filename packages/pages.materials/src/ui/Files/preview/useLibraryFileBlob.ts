import { useEffect, useState } from 'react';
import { useGetClassroomFile, useGetLibraryFile } from 'common.services';

export type FileContentSource =
  { type: 'library' } | { type: 'classroom'; classroomId: string; isTutor: boolean };

export const useLibraryFileBlob = (
  fileId: string | null,
  source: FileContentSource = { type: 'library' },
) => {
  const isLibrary = source.type === 'library';
  const isClassroom = source.type === 'classroom';
  const classroomId = source.type === 'classroom' ? source.classroomId : '';
  const isTutor = source.type === 'classroom' ? source.isTutor : true;

  const libraryQuery = useGetLibraryFile(fileId ?? '', { disabled: !fileId || !isLibrary });
  const classroomQuery = useGetClassroomFile(classroomId, fileId ?? '', isTutor, {
    disabled: !fileId || !isClassroom || !classroomId,
  });

  const query = isClassroom ? classroomQuery : libraryQuery;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const blob = query.data?.status === 200 ? query.data.data : null;

  useEffect(() => {
    if (!blob) {
      setBlobUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return {
    blob,
    blobUrl,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
};
