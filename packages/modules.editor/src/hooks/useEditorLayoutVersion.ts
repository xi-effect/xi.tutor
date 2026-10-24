import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

export function useEditorLayoutVersion(editor: Editor | null, container: HTMLElement | null) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (!editor || !container) return;

    let raf = 0;
    // throttle через rAF: не больше одного ре-рендера на кадр
    const bump = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVersion((v) => v + 1));
    };

    const ro = new ResizeObserver(bump);
    ro.observe(container);
    ro.observe(editor.view.dom);

    editor.on('update', bump);
    window.addEventListener('resize', bump);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      editor.off('update', bump);
      window.removeEventListener('resize', bump);
    };
  }, [editor, container]);
}
