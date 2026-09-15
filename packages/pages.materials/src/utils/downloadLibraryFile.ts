import { getClassroomFileRequest, getLibraryFileRequest, handleError, saveBlob } from 'common.services';
import type { FileContentSource } from '../ui/Files/preview/useLibraryFileBlob';

export const downloadLibraryFile = async (
  fileId: string,
  fileName: string,
  source: FileContentSource = { type: 'library' },
): Promise<void> => {
  try {
    const result =
      source.type === 'classroom'
        ? await getClassroomFileRequest(source.classroomId, fileId, source.isTutor)
        : await getLibraryFileRequest(fileId);
    if (result.status !== 200 || !result.data) return;
    await saveBlob(result.data, { fileName });
  } catch (error) {
    handleError(error, 'files');
  }
};
