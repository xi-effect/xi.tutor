import { uploadFileIdRequest, type UploadFileVars } from './uploadFileRequest';

export type UploadAudioVars = UploadFileVars;

/** @deprecated Use uploadFileRequest — бэкенд сам определяет kind. */
export async function uploadAudioRequest(vars: UploadAudioVars): Promise<string> {
  return uploadFileIdRequest(vars);
}
