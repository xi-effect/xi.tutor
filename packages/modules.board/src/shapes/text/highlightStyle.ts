/**
 * Цвет и прозрачность текстового выделения (mark highlight).
 * В документе храним имя цвета доски и непрозрачность, а в HTML — готовый фон.
 */

import type { TiptapEditor } from '@ibodr/draw';
import { getBoardColorOption } from '../../utils/boardColors';
import type { DrRichTextWithNodesT, MarkT, RichNodeT } from './types';
import { hasFormat } from './utils/textEditorUtils';

export type TextHighlightStyle = {
  color: string;
  opacity: number;
};

export const DEFAULT_TEXT_HIGHLIGHT_PRESETS: TextHighlightStyle[] = [
  { color: 'yellow', opacity: 100 },
  { color: 'green', opacity: 60 },
  { color: 'blue', opacity: 40 },
];

/** Старые выделения без атрибутов рисуются жёлтым фоном из CSS редактора. */
export const LEGACY_TEXT_HIGHLIGHT: TextHighlightStyle = DEFAULT_TEXT_HIGHLIGHT_PRESETS[0];

export const clampHighlightOpacity = (value: number): number => {
  if (!Number.isFinite(value)) return 100;
  const stepped = Math.round(value / 10) * 10;
  return Math.min(100, Math.max(10, stepped));
};

export const normalizeHighlightStyle = (color: string, opacity: number): TextHighlightStyle => {
  const known = getBoardColorOption(color);
  return {
    color: known?.name ?? LEGACY_TEXT_HIGHLIGHT.color,
    opacity: clampHighlightOpacity(opacity),
  };
};

export const highlightStyleKey = (style: TextHighlightStyle): string =>
  `${style.color}:${style.opacity}`;

export const stylesEqual = (left: TextHighlightStyle, right: TextHighlightStyle): boolean =>
  left.color === right.color && left.opacity === right.opacity;

/** CSS-фон выделения. Непрозрачность 100 оставляет токен палитры как есть. */
export const highlightBackgroundCss = (style: TextHighlightStyle): string => {
  const token = getBoardColorOption(style.color)?.cssVar ?? 'var(--xi-yellow-100)';
  if (style.opacity >= 100) return token;
  return `color-mix(in srgb, ${token} ${style.opacity}%, transparent)`;
};

type HighlightAttrs = {
  color?: string | null;
  opacity?: string | number | null;
};

export const highlightStyleFromAttrs = (
  attrs?: HighlightAttrs | null,
): TextHighlightStyle | null => {
  if (!attrs?.color || !getBoardColorOption(attrs.color)) return null;
  return normalizeHighlightStyle(attrs.color, Number(attrs.opacity ?? 100));
};

export const toHighlightAttrs = (style: TextHighlightStyle): { color: string; opacity: string } => {
  const normalized = normalizeHighlightStyle(style.color, style.opacity);
  return { color: normalized.color, opacity: String(normalized.opacity) };
};

export const renderHighlightHTML = (attributes: HighlightAttrs): Record<string, string> => {
  const style = highlightStyleFromAttrs(attributes);
  if (!style) return {};

  return {
    'data-color': style.color,
    'data-opacity': String(style.opacity),
    style: `background-color: ${highlightBackgroundCss(style)}; color: inherit`,
  };
};

const highlightMark = (style: TextHighlightStyle): MarkT => ({
  type: 'highlight',
  attrs: toHighlightAttrs(style),
});

const isHighlightMark = (mark: MarkT): boolean => mark.type === 'highlight';

const visitTextNodes = (richTexts: DrRichTextWithNodesT[], visit: (node: RichNodeT) => void) => {
  const walk = (node: RichNodeT) => {
    if (node.type === 'text') visit(node);
    node.content?.forEach(walk);
  };

  richTexts.forEach(walk);
};

const mapHighlightMarks = (
  richTexts: DrRichTextWithNodesT[],
  update: (mark: MarkT | null) => MarkT | null,
): DrRichTextWithNodesT[] => {
  const clone = structuredClone(richTexts);

  visitTextNodes(clone, (node) => {
    const marks = node.marks ? [...node.marks] : [];
    const index = marks.findIndex(isHighlightMark);
    const next = update(index >= 0 ? marks[index] : null);

    if (next) {
      if (index >= 0) marks[index] = next;
      else marks.push(next);
    } else if (index >= 0) {
      marks.splice(index, 1);
    }

    if (marks.length > 0) node.marks = marks;
    else delete node.marks;
  });

  return clone;
};

/** Ставит выделение на каждый текстовый узел. */
export const applyHighlightStyle = (
  richTexts: DrRichTextWithNodesT[],
  style: TextHighlightStyle,
): DrRichTextWithNodesT[] => {
  const mark = highlightMark(style);
  return mapHighlightMarks(richTexts, () => mark);
};

/** Меняет цвет уже выделенных фрагментов, не закрашивая обычный текст. */
export const updateExistingHighlight = (
  richTexts: DrRichTextWithNodesT[],
  style: TextHighlightStyle,
): DrRichTextWithNodesT[] => {
  const mark = highlightMark(style);
  return mapHighlightMarks(richTexts, (current) => (current ? mark : null));
};

export const removeHighlight = (richTexts: DrRichTextWithNodesT[]): DrRichTextWithNodesT[] =>
  mapHighlightMarks(richTexts, () => null);

export const hasHighlightMark = (richTexts: DrRichTextWithNodesT[]): boolean => {
  let found = false;
  visitTextNodes(richTexts, (node) => {
    if (node.marks?.some(isHighlightMark)) found = true;
  });
  return found;
};

/** Общий стиль выделенных фрагментов. Разные цвета дают null. */
export const readCommonHighlightStyle = (
  richTexts: DrRichTextWithNodesT[],
): TextHighlightStyle | null => {
  const styles: TextHighlightStyle[] = [];

  visitTextNodes(richTexts, (node) => {
    const mark = node.marks?.find(isHighlightMark);
    if (!mark) return;
    styles.push(highlightStyleFromAttrs(mark.attrs) ?? LEGACY_TEXT_HIGHLIGHT);
  });

  if (styles.length === 0) return null;

  const [first] = styles;
  return styles.every((style) => stylesEqual(style, first)) ? first : null;
};

export const readEditorHighlightStyle = (
  textEditor: TiptapEditor | null,
): TextHighlightStyle | null => {
  if (!textEditor || !hasFormat(textEditor, 'highlight')) return null;

  const attrs = textEditor.getAttributes('highlight') as HighlightAttrs;
  return highlightStyleFromAttrs(attrs) ?? LEGACY_TEXT_HIGHLIGHT;
};

type HighlightEditorChain = {
  focus: () => HighlightEditorChain;
  extendMarkRange: (mark: string) => HighlightEditorChain;
  setHighlight: (attrs: { color: string; opacity: string }) => HighlightEditorChain;
  unsetHighlight: () => HighlightEditorChain;
  run: () => boolean;
};

const highlightChain = (textEditor: TiptapEditor): HighlightEditorChain =>
  textEditor.chain() as unknown as HighlightEditorChain;

/** Красит текущее выделение или уже выделенный фрагмент под курсором. */
export const applyHighlightToSelection = (
  textEditor: TiptapEditor,
  style: TextHighlightStyle,
): boolean => {
  const attrs = toHighlightAttrs(style);
  const chain = highlightChain(textEditor).focus();
  const { empty } = textEditor.state.selection;

  if (!empty) {
    chain.setHighlight(attrs).run();
    return true;
  }

  if (textEditor.isActive('highlight')) {
    chain.extendMarkRange('highlight').setHighlight(attrs).run();
    return true;
  }

  return false;
};

export const toggleHighlightInEditor = (textEditor: TiptapEditor, style: TextHighlightStyle) => {
  const chain = highlightChain(textEditor).focus();

  if (textEditor.isActive('highlight')) {
    if (textEditor.state.selection.empty) {
      chain.extendMarkRange('highlight').unsetHighlight().run();
    } else {
      chain.unsetHighlight().run();
    }
    return;
  }

  chain.setHighlight(toHighlightAttrs(style)).run();
};
