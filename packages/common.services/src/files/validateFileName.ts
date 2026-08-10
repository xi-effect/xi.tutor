export const MAX_FILENAME_LENGTH = 100;

export const FILE_NAME_TOO_LONG_MESSAGE = 'Название файла слишком длинное. Максимум 100 символов.';

export function isFileNameTooLong(fileName: string): boolean {
  return fileName.length > MAX_FILENAME_LENGTH;
}

export function assertValidFileName(file: File): void {
  if (isFileNameTooLong(file.name)) {
    throw new Error(FILE_NAME_TOO_LONG_MESSAGE);
  }
}
