import {
  renderHtmlFromRichText,
  renderPlaintextFromRichText,
  type DrShape,
  type Editor,
} from '@ibodr/draw';
import { getShapesWithRichText } from '../shapes/text/utils/shapeUtils';

type RichTextNode = {
  type?: string;
  text?: string;
  attrs?: { latex?: string; 'data-latex'?: string };
  content?: RichTextNode[];
};

export function visualizationSignalScore(text: string): number {
  const value = text.trim();
  if (!value) return 0;
  let score = value.length;
  if (/\\sqrt|sqrt\(|√/.test(value)) score += 800;
  if (/\\circ|\^\{?\\?circ|°/.test(value)) score += 400;
  if (/[A-ZА-Я]{3}/.test(value)) score += 300;
  if (/треугольник|окружност|угол/.test(value.toLowerCase())) score += 100;
  return score;
}

export function pickVisualizationText(candidates: string[]): string {
  return candidates.reduce((best, current) => {
    const text = current.trim();
    if (visualizationSignalScore(text) > visualizationSignalScore(best)) return text;
    return best;
  }, '');
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

export function visualizationTextFromHtml(html: string): string {
  if (!html) return '';
  const withLatex = decodeHtmlEntities(html).replace(
    /<[^>]*data-latex=(["'])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/[^>]+>/gi,
    (_all, _quote, latex) => ` ${latex} `,
  );
  return withLatex
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function visualizationTextFromRichText(richText: unknown): string {
  const parts: string[] = [];

  const visit = (node: unknown) => {
    if (node == null) return;
    if (typeof node === 'string') {
      parts.push(node);
      return;
    }
    if (typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    const record = node as RichTextNode & Record<string, unknown>;
    if (typeof record.text === 'string') parts.push(record.text);

    const attrs = record.attrs;
    const latex = attrs?.latex ?? attrs?.['data-latex'];
    if (typeof latex === 'string' && latex.trim()) {
      parts.push(` ${latex.trim()} `);
    }

    if (Array.isArray(record.content)) {
      record.content.forEach(visit);
      if (
        record.type === 'paragraph' ||
        record.type === 'heading' ||
        record.type === 'blockquote'
      ) {
        parts.push('\n');
      }
    }
  };

  visit(richText);
  return parts
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function safeRender(run: () => string): string {
  try {
    return run().trim();
  } catch {
    return '';
  }
}

export function extractSelectedText(editor: Editor): { text: string; source: DrShape | null } {
  const selected = editor.getSelectedShapes().filter((shape) => !shape.isLocked);
  const withText = getShapesWithRichText(selected);

  if (withText.length === 0) {
    return { text: '', source: null };
  }

  const parts = withText.map((shape) => {
    const richText = shape.props.richText;
    return pickVisualizationText([
      visualizationTextFromRichText(richText),
      safeRender(() => renderPlaintextFromRichText(editor, richText)),
      visualizationTextFromHtml(safeRender(() => renderHtmlFromRichText(editor, richText))),
    ]);
  });

  return {
    text: parts.filter(Boolean).join('\n').trim(),
    source: withText[0],
  };
}
