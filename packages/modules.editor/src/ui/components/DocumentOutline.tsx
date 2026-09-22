import { Editor } from '@tiptap/core';
import { CSSProperties, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@xipkg/utils';
import { EDITOR_MOBILE_MEDIA_QUERY } from '../../const/breakpoints';

type OutlineItem = {
  id: string;
  pos: number;
  level: number;
  text: string;
};

type DocumentOutlineProps = {
  editor: Editor;
};

const MIN_PANEL_WIDTH = 640;
/** Шапка 56px + небольшой зазор, чтобы заголовок не уезжал под неё. */
const HEADER_SCROLL_OFFSET = 80;
/** Как у шапки заметки: `px-5` страницы + `px-2` самой шапки. */
const PAGE_RIGHT_INSET = 28;
const PAGE_TOP_INSET = 80;

function collectHeadings(editor: Editor): OutlineItem[] {
  const items: OutlineItem[] = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'heading') return true;

    items.push({
      id: String(node.attrs.id ?? pos),
      pos,
      level: Number(node.attrs.level) || 1,
      text: node.textContent.trim(),
    });

    return true;
  });

  return items;
}

function headingsEqual(a: OutlineItem[], b: OutlineItem[]) {
  if (a.length !== b.length) return false;

  return a.every(
    (item, index) =>
      item.id === b[index].id &&
      item.pos === b[index].pos &&
      item.level === b[index].level &&
      item.text === b[index].text,
  );
}

function getHeadingDom(editor: Editor, pos: number): HTMLElement | null {
  const nodeDom = editor.view.nodeDOM(pos);
  if (nodeDom instanceof HTMLElement) return nodeDom;
  if (nodeDom instanceof Node && nodeDom.parentElement) return nodeDom.parentElement;
  return null;
}

function getScrollParent(el: HTMLElement): HTMLElement | Window {
  let parent = el.parentElement;

  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return parent;
    }
    parent = parent.parentElement;
  }

  return window;
}

function scrollHeadingIntoView(heading: HTMLElement, scrollRoot: HTMLElement | Window) {
  if (scrollRoot instanceof Window) {
    const top = heading.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    return;
  }

  const nextTop =
    scrollRoot.scrollTop +
    heading.getBoundingClientRect().top -
    scrollRoot.getBoundingClientRect().top -
    HEADER_SCROLL_OFFSET;

  scrollRoot.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
}

function resolveActiveId(editor: Editor, items: OutlineItem[], scrollRoot: HTMLElement | Window) {
  const line =
    scrollRoot instanceof Window
      ? HEADER_SCROLL_OFFSET
      : scrollRoot.getBoundingClientRect().top + HEADER_SCROLL_OFFSET;

  let activeId = items[0]?.id;

  for (const item of items) {
    const heading = getHeadingDom(editor, item.pos);
    if (!heading) continue;
    if (heading.getBoundingClientRect().top <= line) {
      activeId = item.id;
    } else {
      break;
    }
  }

  return activeId;
}

export const DocumentOutline = ({ editor }: DocumentOutlineProps) => {
  const { t } = useTranslation('editor');
  const isMobile = useMediaQuery(EDITOR_MOBILE_MEDIA_QUERY);
  const [items, setItems] = useState<OutlineItem[]>(() => collectHeadings(editor));
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);
  const [wideEnough, setWideEnough] = useState(false);
  const [dockStyle, setDockStyle] = useState<CSSProperties>();

  const syncHeadings = useCallback(() => {
    const next = collectHeadings(editor);
    setItems((prev) => (headingsEqual(prev, next) ? prev : next));
  }, [editor]);

  useEffect(() => {
    syncHeadings();
    editor.on('update', syncHeadings);
    editor.on('selectionUpdate', syncHeadings);

    return () => {
      editor.off('update', syncHeadings);
      editor.off('selectionUpdate', syncHeadings);
    };
  }, [editor, syncHeadings]);

  useEffect(() => {
    const scrollRoot = getScrollParent(editor.view.dom);
    const panel = scrollRoot instanceof Window ? document.documentElement : scrollRoot;

    const updateDock = () => {
      const rect =
        scrollRoot instanceof Window
          ? { top: 0, right: window.innerWidth, width: window.innerWidth }
          : scrollRoot.getBoundingClientRect();

      setWideEnough(rect.width >= MIN_PANEL_WIDTH);
      setDockStyle({
        top: rect.top + PAGE_TOP_INSET,
        right: Math.max(PAGE_RIGHT_INSET, window.innerWidth - rect.right + PAGE_RIGHT_INSET),
      });
    };

    updateDock();

    const observer = new ResizeObserver(updateDock);
    observer.observe(panel);
    window.addEventListener('resize', updateDock);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDock);
    };
  }, [editor]);

  useEffect(() => {
    if (items.length === 0) {
      setActiveId(undefined);
      return;
    }

    const scrollRoot = getScrollParent(editor.view.dom);

    const updateActive = () => {
      setActiveId(resolveActiveId(editor, items, scrollRoot));
    };

    updateActive();
    scrollRoot.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);

    return () => {
      scrollRoot.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [editor, items]);

  if (isMobile || !wideEnough || items.length === 0) {
    return null;
  }

  const jumpTo = (item: OutlineItem) => {
    editor
      .chain()
      .setTextSelection(item.pos + 1)
      .focus(undefined, { scrollIntoView: false })
      .run();

    const heading = getHeadingDom(editor, item.pos);
    if (!heading) return;

    const scrollRoot = getScrollParent(editor.view.dom);
    requestAnimationFrame(() => {
      scrollHeadingIntoView(heading, scrollRoot);
    });
  };

  return (
    <nav className="document-outline" aria-label={t('outline.title')} style={dockStyle}>
      {items.map((item) => {
        const label = item.text || t('outline.emptyHeading');

        return (
          <button
            key={`${item.id}-${item.pos}`}
            type="button"
            className="document-outline-item"
            data-level={item.level}
            data-active={item.id === activeId}
            aria-current={item.id === activeId ? 'location' : undefined}
            aria-label={t('outline.goTo', { heading: label })}
            onClick={() => jumpTo(item)}
          >
            <span className="document-outline-tooltip">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
