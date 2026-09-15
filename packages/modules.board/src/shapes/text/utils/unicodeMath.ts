const MATH_LETTER_RANGES: [number, number, number][] = [
  [0x1d400, 0x1d419, 65],
  [0x1d41a, 0x1d433, 97],
  [0x1d434, 0x1d44d, 65],
  [0x1d44e, 0x1d467, 97],
  [0x1d468, 0x1d481, 65],
  [0x1d482, 0x1d49b, 97],
  [0x1d4d0, 0x1d4e9, 65],
  [0x1d4ea, 0x1d503, 97],
  [0x1d5d4, 0x1d5ed, 65],
  [0x1d5ee, 0x1d607, 97],
  [0x1d608, 0x1d621, 65],
  [0x1d622, 0x1d63b, 97],
  [0x1d63c, 0x1d655, 65],
  [0x1d656, 0x1d66f, 97],
  [0x1d670, 0x1d689, 65],
  [0x1d68a, 0x1d6a3, 97],
];

const INVISIBLE_MATH = /[\u2061-\u2064]/g;
const MATH_SPACE_CHARS = /[\u00a0\u2008-\u200b\u202f\u205f]/;
const RADICAL_CHARS = new Set(['√', '∛', '∜']);

function mathAlphanumericToAscii(codePoint: number): string | null {
  if (codePoint === 0x210e) return 'h';
  for (const [from, to, ascii] of MATH_LETTER_RANGES) {
    if (codePoint >= from && codePoint <= to) {
      return String.fromCharCode(ascii + (codePoint - from));
    }
  }
  if (codePoint >= 0x1d7ce && codePoint <= 0x1d7d7) return String(codePoint - 0x1d7ce);
  if (codePoint >= 0x1d7d8 && codePoint <= 0x1d7e1) return String(codePoint - 0x1d7d8);
  if (codePoint >= 0x1d7e2 && codePoint <= 0x1d7eb) return String(codePoint - 0x1d7e2);
  if (codePoint >= 0x1d7ec && codePoint <= 0x1d7f5) return String(codePoint - 0x1d7ec);
  if (codePoint >= 0x1d7f6 && codePoint <= 0x1d7ff) return String(codePoint - 0x1d7f6);
  return null;
}

export function normalizeUnicodeMathText(text: string): string {
  let result = '';
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint == null) continue;
    const mapped = mathAlphanumericToAscii(codePoint);
    if (mapped != null) {
      result += mapped;
      continue;
    }
    if (codePoint === 0x2212 || codePoint === 0x2013 || codePoint === 0x2014) {
      result += '-';
      continue;
    }
    if (codePoint === 0x00d7 || codePoint === 0x22c5) {
      result += '\\times ';
      continue;
    }
    result += char;
  }
  return result.replace(INVISIBLE_MATH, '').replace(/[\u00a0\u2008-\u200b\u202f\u205f]/g, '');
}

function isCyrillic(char: string): boolean {
  return /[\u0400-\u04FF]/.test(char);
}

function isMathRunChar(char: string): boolean {
  if (isCyrillic(char)) return false;
  const codePoint = char.codePointAt(0) ?? 0;
  if (codePoint === 0x2062 || codePoint === 0x2061 || codePoint === 0x2063) return true;
  if (codePoint === 0x2212 || codePoint === 0x2013 || codePoint === 0x2014 || codePoint === 0x00d7)
    return true;
  if (RADICAL_CHARS.has(char)) return true;
  if (codePoint >= 0x1d400 && codePoint <= 0x1d7ff) return true;
  if (codePoint === 0x210e) return true;
  if (MATH_SPACE_CHARS.test(char) || char === ' ') return true;
  return /[0-9A-Za-z=+\-*/^_().,\\]/.test(char);
}

function hasUnicodeMathSignal(text: string): boolean {
  return /[√∛∜\u2062\u2061\u{1D400}-\u{1D7FF}\u210E]/u.test(text);
}

function toCodePoints(text: string): { chars: string[]; starts: number[] } {
  const chars: string[] = [];
  const starts: number[] = [];
  let index = 0;
  while (index < text.length) {
    const char = String.fromCodePoint(text.codePointAt(index) ?? 0);
    chars.push(char);
    starts.push(index);
    index += char.length;
  }
  return { chars, starts };
}

export function findUnicodeMathRuns(text: string): { from: number; to: number }[] {
  const { chars, starts } = toCodePoints(text);
  const hot = chars.map((char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    return (
      codePoint === 0x2062 ||
      codePoint === 0x2061 ||
      RADICAL_CHARS.has(char) ||
      (codePoint >= 0x1d400 && codePoint <= 0x1d7ff) ||
      codePoint === 0x210e
    );
  });

  const runs: { from: number; to: number }[] = [];
  let cursor = 0;
  while (cursor < chars.length) {
    if (!hot[cursor]) {
      cursor += 1;
      continue;
    }
    let from = cursor;
    let to = cursor + 1;
    while (from > 0 && isMathRunChar(chars[from - 1] ?? '')) from -= 1;
    while (to < chars.length && isMathRunChar(chars[to] ?? '')) to += 1;
    while (from < to && (chars[from] === ' ' || MATH_SPACE_CHARS.test(chars[from] ?? '')))
      from += 1;
    while (to > from && (chars[to - 1] === ' ' || MATH_SPACE_CHARS.test(chars[to - 1] ?? '')))
      to -= 1;
    const slice = chars.slice(from, to).join('');
    if (to > from && hasUnicodeMathSignal(slice)) {
      const fromIndex = starts[from] ?? 0;
      const toIndex = to >= starts.length ? text.length : (starts[to] ?? text.length);
      runs.push({ from: fromIndex, to: toIndex });
    }
    cursor = Math.max(to, cursor + 1);
  }
  return mergeRuns(runs);
}

function mergeRuns(runs: { from: number; to: number }[]): { from: number; to: number }[] {
  if (runs.length === 0) return [];
  const sorted = [...runs].sort((a, b) => a.from - b.from);
  const merged = [sorted[0]];
  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const last = merged[merged.length - 1];
    if (current.from <= last.to) last.to = Math.max(last.to, current.to);
    else merged.push({ ...current });
  }
  return merged;
}

function wrapRadicals(compact: string): string {
  const commands: Record<string, string> = {
    '√': '\\sqrt',
    '∛': '\\sqrt[3]',
    '∜': '\\sqrt[4]',
  };
  let result = '';
  let index = 0;
  while (index < compact.length) {
    const char = compact[index] ?? '';
    const command = commands[char];
    if (!command) {
      result += char;
      index += 1;
      continue;
    }
    index += 1;
    let end = index;
    while (end < compact.length) {
      const next = compact[end] ?? '';
      if (next === '=' || commands[next]) break;
      end += 1;
    }
    result += `${command}{${compact.slice(index, end)}}`;
    index = end;
  }
  return result;
}

/** ФИПИ/MathJax копирует 2^{-4-x} как «2−⁢4⁢−⁢𝑥». */
export function unicodeMathRunToLatex(run: string): string {
  const compact = wrapRadicals(normalizeUnicodeMathText(run).replace(/\s+/g, ''));
  const equals = compact.indexOf('=');
  const left = equals === -1 ? compact : compact.slice(0, equals);
  const right = equals === -1 ? '' : compact.slice(equals);
  const power = left.match(/^(\d+)(-.+)$/);
  if (run.includes('\u2062') && power) {
    return `${power[1]}^{${power[2]}}${right}`;
  }
  return compact;
}
