import { InputRule, mergeAttributes } from '@tiptap/core';
import { InlineMath } from '@tiptap/extension-mathematics';
import type { Node as PMNode, Schema } from '@tiptap/pm/model';
import { Plugin, PluginKey, type Selection, type Transaction } from '@tiptap/pm/state';
import katex from 'katex';
import { reconstructPastedMath } from './utils/clipboardMath';
import { requestInlineMathEdit } from './utils/inlineMathEdit';
import { findInlineMathSegments } from './utils/mathLatex';

function selectionOverlaps(from: number, to: number, selection?: Selection): boolean {
  if (!selection) return false;
  if (selection.from === selection.to) {
    return selection.from > from && selection.from < to;
  }
  return selection.from < to && selection.to > from;
}

function collectMathJobs(
  doc: PMNode,
  selection?: Selection,
): { from: number; to: number; latex: string }[] {
  const jobs: { from: number; to: number; latex: string }[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return;
    const text = node.textBetween(0, node.content.size);
    const segments = findInlineMathSegments(text);
    if (segments.length === 0) return false;

    const stringToDocPos: number[] = [];
    node.forEach((child, offset) => {
      if (!child.isText || !child.text) return;
      for (let index = 0; index < child.text.length; index += 1) {
        stringToDocPos.push(pos + 1 + offset + index);
      }
    });

    for (const segment of segments) {
      const from = stringToDocPos[segment.from];
      const last = stringToDocPos[segment.to - 1];
      if (from == null || last == null) continue;
      const to = last + 1;
      if (selectionOverlaps(from, to, selection)) continue;
      jobs.push({ from, to, latex: segment.latex });
    }
    return false;
  });
  return jobs;
}

function applyInlineMathJobs(schema: Schema, tr: Transaction, selection?: Selection): boolean {
  const inlineMath = schema.nodes.inlineMath;
  if (!inlineMath) return false;
  const jobs = collectMathJobs(tr.doc, selection);
  if (jobs.length === 0) return false;

  for (let index = jobs.length - 1; index >= 0; index -= 1) {
    const job = jobs[index];
    const from = tr.mapping.map(job.from);
    const to = tr.mapping.map(job.to);
    tr.replaceWith(from, to, inlineMath.create({ latex: job.latex }));
  }
  return true;
}

function renderInlineMathDom(latex: string, htmlAttributes: Record<string, unknown>) {
  const span = document.createElement('span');
  const attrs = mergeAttributes(htmlAttributes, {
    'data-type': 'inline-math',
    'data-latex': latex,
    class: 'tiptap-mathematics-render',
  });
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'string' && value.length > 0) {
      span.setAttribute(key, value);
    }
  }
  try {
    katex.render(latex, span, { throwOnError: false, output: 'html' });
  } catch {
    span.textContent = latex;
  }
  return span;
}

export const BoardInlineMath = InlineMath.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      onClick: (node: { attrs?: { latex?: string } }, pos: number) => {
        requestInlineMathEdit({
          pos,
          latex: String(node.attrs?.latex ?? ''),
        });
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = String(node.attrs.latex ?? '');
    if (typeof document === 'undefined') {
      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'inline-math',
          'data-latex': latex,
          class: 'tiptap-mathematics-render',
        }),
        latex,
      ];
    }
    return renderInlineMathDom(latex, HTMLAttributes);
  },

  renderText({ node }) {
    return String(node.attrs.latex ?? '');
  },

  addInputRules() {
    const type = this.type;
    return [
      ...(this.parent?.() ?? []),
      new InputRule({
        find: /\$(?!\d+\$)([^$\n]+?)\$(?!\d)$/,
        handler: ({ range, match, state }) => {
          const latex = match[1]?.trim();
          if (!latex) return;
          state.tr.replaceWith(range.from, range.to, type.create({ latex }));
        },
      }),
      new InputRule({
        find: /\\\((.+?)\\\)$/,
        handler: ({ range, match, state }) => {
          const latex = match[1]?.trim();
          if (!latex) return;
          state.tr.replaceWith(range.from, range.to, type.create({ latex }));
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      new Plugin({
        key: new PluginKey('boardInlineMathPaste'),
        props: {
          handlePaste(view, event) {
            const plain = event.clipboardData?.getData('text/plain') ?? '';
            const html = event.clipboardData?.getData('text/html') ?? '';
            const reconstructed = reconstructPastedMath(plain, html);
            if (findInlineMathSegments(reconstructed).length === 0) return false;
            event.preventDefault();
            const { from, to } = view.state.selection;
            view.dispatch(view.state.tr.insertText(reconstructed, from, to));
            return true;
          },
        },
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((transaction) => transaction.docChanged)) return null;
          if (collectMathJobs(newState.doc, newState.selection).length === 0) return null;
          const { tr } = newState;
          applyInlineMathJobs(newState.schema, tr, newState.selection);
          return tr.docChanged ? tr : null;
        },
        view(editorView) {
          const migrateExisting = () => {
            const { tr, selection } = editorView.state;
            applyInlineMathJobs(editorView.state.schema, tr, selection);
            if (tr.docChanged) editorView.dispatch(tr);
          };
          queueMicrotask(migrateExisting);
          return {};
        },
      }),
    ];
  },
});
