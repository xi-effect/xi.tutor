import { computePosition, type ComputePositionConfig, type VirtualElement } from '@floating-ui/dom';
import type { Editor } from '@tiptap/core';

export function getDragHandleElement(editor: Editor): HTMLElement | null {
  return editor.view.dom.parentElement?.querySelector('.drag-handle') ?? null;
}

export function getFirstBlockAnchor(editor: Editor): { pos: number; id: string | null } | null {
  const { doc } = editor.state;
  if (doc.childCount === 0) return null;

  const node = doc.child(0);
  if (!node?.isBlock) return null;

  return {
    pos: 0,
    id: node.attrs?.id ?? node.attrs?.['id'] ?? null,
  };
}

export function positionDragHandle(
  editor: Editor,
  getVirtualElement: () => VirtualElement | null,
  computePositionConfig: ComputePositionConfig,
) {
  const element = getDragHandleElement(editor);
  const virtualElement = getVirtualElement();
  if (!element || !virtualElement || editor.isDestroyed) return;

  void computePosition(virtualElement, element, computePositionConfig).then((val) => {
    if (editor.isDestroyed) return;
    Object.assign(element.style, {
      position: val.strategy,
      left: `${val.x}px`,
      top: `${val.y}px`,
      visibility: '',
      pointerEvents: 'auto',
    });
  });
}
