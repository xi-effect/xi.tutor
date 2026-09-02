import { uploadFileIdRequest, type UploadFileVars } from './uploadFileRequest';

export type UploadAudioVars = UploadFileVars;

/** @deprecated Use uploadFileRequest — backend determines file kind. */
export async function uploadAudioRequest(vars: UploadAudioVars): Promise<string> {
  return uploadFileIdRequest(vars);
}
