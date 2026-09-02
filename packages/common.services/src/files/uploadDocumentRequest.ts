import { uploadFileIdRequest, type UploadFileVars } from './uploadFileRequest';

export type UploadDocumentVars = UploadFileVars;

/** @deprecated Use uploadFileRequest — backend determines file kind. */
export async function uploadDocumentRequest(vars: UploadDocumentVars): Promise<string> {
  return uploadFileIdRequest(vars);
}
