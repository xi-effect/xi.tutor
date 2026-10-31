import type { Editor } from '@tiptap/react';
import { getThreadMarkRange } from '../comments/commentQueries';

function getScrollParent(el: HTMLElement): HTMLElement | null {
  let p = el.parentElement;
  while (p) {
    if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) return p;
    p = p.parentElement;
  }
  return null; // скроллится window
}

/** Держит комментарий примерно по центру, пока документ дозагружается (картинки и т.п.). */
export function keepCommentCentered(editor: Editor, threadId: string, maxMs = 5000) {
  const dom = editor.view.dom as HTMLElement;
  const parent = getScrollParent(dom);

  const center = () => {
    if (editor.isDestroyed) return stop();

    // позицию берём заново: документ мог измениться (картинки, правки других пользователей)
    const range = getThreadMarkRange(editor, threadId);
    if (!range) return;

    const start = editor.view.coordsAtPos(range.from, 1);
    const end = editor.view.coordsAtPos(range.to, -1);
    const textMid = (start.top + end.bottom) / 2;

    const viewport = parent
      ? parent.getBoundingClientRect()
      : { top: 0, height: window.innerHeight };
    const viewportMid = viewport.top + viewport.height / 2;

    const delta = textMid - viewportMid;
    if (Math.abs(delta) < 8) return;

    if (parent) parent.scrollBy({ top: delta, behavior: 'smooth' });
    else window.scrollBy({ top: delta, behavior: 'auto' });
  };

  const ro = new ResizeObserver(center);
  const timer = setTimeout(() => stop(), maxMs);

  const stop = () => {
    ro.disconnect();
    clearTimeout(timer);
    for (const evt of ['wheel', 'touchmove', 'keydown', 'mousedown'] as const) {
      window.removeEventListener(evt, stop);
    }
  };

  ro.observe(dom);
  for (const evt of ['wheel', 'touchmove', 'keydown', 'mousedown'] as const) {
    window.addEventListener(evt, stop, { passive: true });
  }

  // первый проход сразу, после применения layout
  requestAnimationFrame(center);
}
