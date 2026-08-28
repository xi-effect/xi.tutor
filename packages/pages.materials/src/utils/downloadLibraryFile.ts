import { getLibraryFileRequest, handleError } from 'common.services';

export const downloadLibraryFile = async (fileId: string, fileName: string): Promise<void> => {
  try {
    const result = await getLibraryFileRequest(fileId);
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
