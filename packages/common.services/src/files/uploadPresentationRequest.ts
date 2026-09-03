import { uploadFileIdRequest, type UploadFileVars } from './uploadFileRequest';

export type UploadPresentationVars = UploadFileVars;

/** @deprecated Use uploadFileRequest — backend determines file kind. */
export async function uploadPresentationRequest(vars: UploadPresentationVars): Promise<string> {
  return uploadFileIdRequest(vars);
}
