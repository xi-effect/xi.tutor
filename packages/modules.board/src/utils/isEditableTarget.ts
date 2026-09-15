export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false;

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return !target.readOnly && !target.disabled;
  }

  if (target.closest('math-field, [data-math-editor]')) return true;

  // Только реально редактируемые узлы. `.ProseMirror` / `.tl-text-input` есть
  // и у неактивных подписей на доске — их нельзя считать полем ввода, иначе
  // Ctrl+V на канвас молча глотается.
  return target.isContentEditable;
};
