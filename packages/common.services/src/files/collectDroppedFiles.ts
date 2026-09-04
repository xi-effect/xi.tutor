export function cloneDroppedFile(file: File): File {
  return new File([file], file.name, { type: file.type, lastModified: file.lastModified });
}

type DataTransferLike = {
  files?: FileList | File[] | null;
  items?: ArrayLike<{ kind: string; getAsFile: () => File | null }> | null;
};

function listFromFileList(files: FileList | File[] | null | undefined): File[] {
  if (!files) return [];
  return Array.from(files);
}

/**
 * Safari/Яндекс иногда отдают пустой `files`, но заполненный `items`.
 * Клонируем File сразу: после drop исходный blob может стать нечитаемым.
 */
export function collectDroppedFiles(data: DataTransferLike | null | undefined): File[] {
  if (!data) return [];

  const fromFiles = listFromFileList(data.files).map(cloneDroppedFile);
  if (fromFiles.length > 0) return fromFiles;

  const items = data.items;
  if (!items) return [];

  const fromItems: File[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (!item || item.kind !== 'file') continue;
    const file = item.getAsFile();
    if (file) fromItems.push(cloneDroppedFile(file));
  }

  return fromItems;
}
