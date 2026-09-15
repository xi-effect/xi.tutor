import { uploadFileIdRequest, type UploadFileVars } from './uploadFileRequest';

export type UploadPresentationVars = UploadFileVars;

/** @deprecated Use uploadFileRequest — бэкенд сам определяет kind. */
export async function uploadPresentationRequest(vars: UploadPresentationVars): Promise<string> {
  return uploadFileIdRequest(vars);
}
