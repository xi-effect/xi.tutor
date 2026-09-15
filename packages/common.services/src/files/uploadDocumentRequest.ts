import { uploadFileIdRequest, type UploadFileVars } from './uploadFileRequest';

export type UploadDocumentVars = UploadFileVars;

/** @deprecated Use uploadFileRequest — бэкенд сам определяет kind. */
export async function uploadDocumentRequest(vars: UploadDocumentVars): Promise<string> {
  return uploadFileIdRequest(vars);
}
