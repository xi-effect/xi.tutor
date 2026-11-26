import type { Editor } from '@ibodr/draw';

/** Инструменты, которыми ставят несколько одинаковых элементов подряд. */
const REPEATABLE_TOOLS = new Set(['arrow', 'note', 'frame', 'emoji', 'emoji-sticker']);

/**
 * После создания элемента эти инструменты сами включают выделение.
 * Возвращаем их, чтобы следующий такой же элемент ставился без повторного выбора.
 * Щелчок по панели инструментов повтор не включает. Escape в простое выходит.
 */
export function keepRepeatableToolsArmed(editor: Editor) {
  let armedTool: string | null = null;

  const onPointerDown = (event: PointerEvent) => {
    const canvas = editor.getContainer().querySelector('.dr-canvas');
    const onCanvas = canvas?.contains(event.target as Node) ?? false;
    const toolId = editor.getCurrentToolId();
    armedTool = onCanvas && REPEATABLE_TOOLS.has(toolId) ? toolId : null;
  };

  const onPointerUp = () => {
    const toolId = armedTool;
    armedTool = null;
    if (!toolId) return;

    queueMicrotask(() => {
      if (editor.getCurrentToolId() === toolId) return;
      if (editor.getEditingShapeId()) {
        editor.setEditingShape(null);
      }
      editor.setCurrentTool(toolId);
    });
  };

  const container = editor.getContainer();
  container.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  return () => {
    container.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  };
}
