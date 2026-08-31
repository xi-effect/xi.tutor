import { getClassroomFileRequest, getLibraryFileRequest, handleError } from 'common.services';
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

    const url = window.URL.createObjectURL(result.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    handleError(error, 'files');
  }
};
