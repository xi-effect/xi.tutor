import { findUnicodeMathRuns, unicodeMathRunToLatex } from './unicodeMath';

const MATHISH = /[\\^_{}=+\-*/<>]|\\[a-zA-Z]|sqrt|frac|\d|°|√|≤|≥|≠|π|∞|△|∠/;

export function latexFromSelectedText(text: string, mode: 'wrap' | 'fraction'): string {
  const trimmed = text.trim();
  if (mode === 'fraction') {
    if (!trimmed) return '\\frac{a}{b}';
    const slash = trimmed.indexOf('/');
    if (slash > 0 && slash < trimmed.length - 1) {
      return `\\frac{${trimmed.slice(0, slash).trim()}}{${trimmed.slice(slash + 1).trim()}}`;
    }
    return `\\frac{${trimmed}}{}`;
  }
  const unwrapped = trimmed.replace(/^\$+(.*?)\$+$/s, '$1').trim();
  if (unwrapped.length > 1 && !MATHISH.test(unwrapped) && /^[\p{L}\s]+$/u.test(unwrapped)) {
    return '';
  }
  return unwrapped;
}

export type InlineMathSegment = {
  from: number;
  to: number;
  latex: string;
};

function rangeOverlaps(from: number, to: number, taken: InlineMathSegment[]): boolean {
  return taken.some((item) => from < item.to && to > item.from);
}

/**
 * Находит инлайн-формулы в тексте: `$...$`, `$$...$$`, `\(...\)`.
 * `$100$` не считается формулой, чтобы не ловить валюту.
 */
export function findInlineMathSegments(text: string): InlineMathSegment[] {
  const taken: InlineMathSegment[] = [];

  const collect = (regex: RegExp, group: number) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null = regex.exec(text);
    while (match) {
      const latex = match[group]?.trim();
      const from = match.index;
      const to = from + match[0].length;
      if (latex && !rangeOverlaps(from, to, taken)) {
        taken.push({ from, to, latex });
      }
      match = regex.exec(text);
    }
  };

  collect(/\$\$([^$\n]+?)\$\$/g, 1);
  collect(/\\\(([\s\S]+?)\\\)/g, 1);
  collect(/\$(?!\d+\$)([^$\n]+?)\$(?!\d)/g, 1);

  for (const run of findUnicodeMathRuns(text)) {
    if (rangeOverlaps(run.from, run.to, taken)) continue;
    const latex = unicodeMathRunToLatex(text.slice(run.from, run.to));
    if (latex) taken.push({ from: run.from, to: run.to, latex });
  }

  return taken.sort((a, b) => a.from - b.from);
}

export function getSelectedPlainText(textEditor: {
  state: {
    doc: { textBetween: (from: number, to: number) => string };
    selection: { from: number; to: number };
  };
}): string {
  const { from, to } = textEditor.state.selection;
  if (from === to) return '';
  return textEditor.state.doc.textBetween(from, to);
}

type InlineMathNode = { type: { name: string }; attrs: { latex?: string }; nodeSize: number };

export function getInlineMathNearSelection(textEditor: {
  state: {
    doc: { nodeAt: (pos: number) => InlineMathNode | null };
    selection: { from: number; to: number; node?: InlineMathNode };
  };
}): { pos: number; latex: string } | null {
  const { doc, selection } = textEditor.state;
  const selected = selection.node;
  if (selected?.type.name === 'inlineMath') {
    return { pos: selection.from, latex: String(selected.attrs.latex ?? '') };
  }
  const atCursor = doc.nodeAt(selection.from);
  if (atCursor?.type.name === 'inlineMath') {
    return { pos: selection.from, latex: String(atCursor.attrs.latex ?? '') };
  }
  if (selection.from === selection.to && selection.from > 0) {
    const before = doc.nodeAt(selection.from - 1);
    if (before?.type.name === 'inlineMath') {
      return { pos: selection.from - 1, latex: String(before.attrs.latex ?? '') };
    }
  }
  return null;
}
