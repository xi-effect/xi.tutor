const STORAGE_KEY = 'xi.tutor.file-preview-fullscreen.v1';

export const readFilePreviewFullscreen = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const writeFilePreviewFullscreen = (value: boolean): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // ignore quota / private mode
  }
};
