export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read blob as data URL'));
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read blob as data URL'));
    };

    reader.readAsDataURL(blob);
  });
}
