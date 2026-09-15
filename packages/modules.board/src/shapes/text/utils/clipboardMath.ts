import {
  findUnicodeMathRuns,
  normalizeUnicodeMathText,
  unicodeMathRunToLatex,
} from './unicodeMath';
import { findInlineMathSegments } from './mathLatex';

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&minus;/gi, '−')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&times;/gi, '×')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
}

function unwrapCdata(text: string): string {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

export function extractLatexFromHtml(html: string): string[] {
  if (!html.trim()) return [];
  const found: string[] = [];

  const push = (raw: string) => {
    const latex = unwrapCdata(decodeHtmlEntities(raw)).replace(/\s+/g, ' ').trim();
    if (latex) found.push(latex);
  };

  for (const match of html.matchAll(
    /<annotation[^>]*encoding=["'](?:application\/x-tex|TeX)["'][^>]*>([\s\S]*?)<\/annotation>/gi,
  )) {
    push(match[1]);
  }
  if (found.length > 0) return found;

  for (const match of html.matchAll(
    /<script[^>]*type=["']math\/tex["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    push(match[1]);
  }
  if (found.length > 0) return found;

  for (const match of html.matchAll(/\bdata-latex=["']([^"']+)["']/gi)) {
    push(match[1]);
  }
  if (found.length > 0) return found;

  for (const match of html.matchAll(/<math\b[\s\S]*?<\/math>/gi)) {
    const latex = mathMlToLatex(match[0]);
    if (latex) found.push(latex);
  }
  return found;
}

type XmlNode = { tag: string; children: Array<XmlNode | string> };

function parseXmlNodes(input: string): Array<XmlNode | string> {
  const nodes: Array<XmlNode | string> = [];
  let rest = input;
  while (rest.length > 0) {
    if (rest.startsWith('<!--')) {
      rest = rest.slice(rest.indexOf('-->') + 3);
      continue;
    }
    const tagOpen = rest.match(/^<([A-Za-z:][\w:-]*)([^>]*)>/);
    if (!tagOpen) {
      const nextTag = rest.indexOf('<');
      const text = nextTag === -1 ? rest : rest.slice(0, nextTag);
      if (text) nodes.push(decodeHtmlEntities(text));
      rest = nextTag === -1 ? '' : rest.slice(nextTag);
      if (!tagOpen && rest.startsWith('<') && !rest.match(/^<([A-Za-z:][\w:-]*)/)) {
        nodes.push(rest[0] ?? '');
        rest = rest.slice(1);
      }
      continue;
    }
    const [, rawTag, attrs] = tagOpen;
    const tag = rawTag.toLowerCase().replace(/^m:/, '');
    rest = rest.slice(tagOpen[0].length);
    if (/\/>$/.test(tagOpen[0]) || /\/\s*$/.test(attrs)) {
      nodes.push({ tag, children: [] });
      continue;
    }
    const close = `</${rawTag}>`;
    const closeIndex = indexOfClosingTag(rest, rawTag);
    const inner = closeIndex === -1 ? rest : rest.slice(0, closeIndex);
    const after = closeIndex === -1 ? '' : rest.slice(closeIndex + close.length);
    nodes.push({ tag, children: parseXmlNodes(inner) });
    rest = after;
  }
  return nodes;
}

function indexOfClosingTag(input: string, rawTag: string): number {
  const close = `</${rawTag}>`;
  const open = `<${rawTag}`;
  let depth = 1;
  let index = 0;
  while (index < input.length) {
    const nextOpen = input.indexOf(open, index);
    const nextClose = input.indexOf(close, index);
    if (nextClose === -1) return -1;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      index = nextOpen + open.length;
    } else {
      depth -= 1;
      if (depth === 0) return nextClose;
      index = nextClose + close.length;
    }
  }
  return -1;
}

function nodeLatex(node: XmlNode | string): string {
  if (typeof node === 'string') return normalizeMo(node);
  const children = node.children.map(nodeLatex).join('');
  switch (node.tag) {
    case 'math':
    case 'mrow':
    case 'mstyle':
    case 'semantics':
    case 'mphantom':
      return children;
    case 'annotation':
    case 'annotation-xml':
      return '';
    case 'mi':
    case 'mn':
    case 'mtext':
    case 'ms':
      return normalizeUnicodeMathText(children);
    case 'mo':
      return normalizeMo(children);
    case 'msup':
      return `{${childAt(node, 0)}}^{${childAt(node, 1)}}`;
    case 'msub':
      return `{${childAt(node, 0)}}_{${childAt(node, 1)}}`;
    case 'msubsup':
      return `{${childAt(node, 0)}}_{${childAt(node, 1)}}^{${childAt(node, 2)}}`;
    case 'mfrac':
      return `\\frac{${childAt(node, 0)}}{${childAt(node, 1)}}`;
    case 'msqrt':
      return `\\sqrt{${children}}`;
    case 'mroot':
      return `\\sqrt[${childAt(node, 1)}]{${childAt(node, 0)}}`;
    case 'mspace':
      return '';
    default:
      return children;
  }
}

function childAt(node: XmlNode, index: number): string {
  const child = node.children.filter((item) => typeof item !== 'string' || item.trim())[index];
  return child ? nodeLatex(child) : '';
}

function normalizeMo(text: string): string {
  return text
    .replace(/\u2212/g, '-')
    .replace(/\u2062/g, '')
    .replace(/\s+/g, '');
}

export function mathMlToLatex(mathMl: string): string {
  const nodes = parseXmlNodes(mathMl.trim());
  return nodes.map(nodeLatex).join('').replace(/\s+/g, '');
}

export function reconstructPastedMath(plain: string, html = ''): string {
  const texList = extractLatexFromHtml(html);
  const runs = findUnicodeMathRuns(plain);
  if (texList.length > 0 && runs.length > 0) {
    let result = '';
    let cursor = 0;
    let texIndex = 0;
    for (const run of runs) {
      result += plain.slice(cursor, run.from);
      result += `$${texList[texIndex] ?? unicodeMathRunToLatex(plain.slice(run.from, run.to))}$`;
      texIndex += 1;
      cursor = run.to;
    }
    return result + plain.slice(cursor);
  }
  if (texList.length === 1 && !findUnicodeMathRuns(plain).length) {
    const latex = texList[0];
    if (!plain.trim()) return `$${latex}$`;
    if (!plain.includes(latex) && !plain.includes('$')) {
      return `${plain.trim()} $${latex}$`;
    }
  }
  return plain;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** HTML, который Draw прогоняет через TipTap и превращает в инлайн-формулы. */
export function pastedMathToRichHtml(plain: string, html = ''): string | null {
  const reconstructed = reconstructPastedMath(plain, html);
  const segments = findInlineMathSegments(reconstructed);
  if (segments.length === 0) return null;
  let body = '';
  let cursor = 0;
  for (const segment of segments) {
    body += escapeHtml(reconstructed.slice(cursor, segment.from));
    body += `<span data-type="inline-math" data-latex="${escapeHtml(segment.latex)}" class="tiptap-mathematics-render">${escapeHtml(segment.latex)}</span>`;
    cursor = segment.to;
  }
  body += escapeHtml(reconstructed.slice(cursor));
  return `<p>${body}</p>`;
}
