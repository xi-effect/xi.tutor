export const createFileUploadHttpError = (
  status: number,
  message: string,
  response?: unknown,
): Error =>
  Object.assign(new Error(message), {
    status,
    response: response ?? { status },
  });
