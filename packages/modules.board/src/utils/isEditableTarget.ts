export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  ) {
    return true;
  }

  return !!target.closest(
    '.ProseMirror, .tl-text-input, [contenteditable]:not([contenteditable="false"])',
  );
};
