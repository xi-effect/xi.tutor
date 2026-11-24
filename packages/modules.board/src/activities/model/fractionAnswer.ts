import { parseExactRational } from 'features.bank';

const LATEX_FRACTION = /^\\frac\{[+-]?\d+\}\{[+-]?\d+\}$/;
const PLAIN_FRACTION = /^[+-]?\d+\/[+-]?\d+$/;
const FRACTION_DRAFT = /^([+-]?\d*)\s*\/\s*([+-]?\d*)$/;

/** Ответ в карточке записан обыкновенной дробью, а не десятичной и не целым числом. */
export function expectsFractionAnswer(display: string): boolean {
  const text = display
    .trim()
    .replace(/^\$+|\$+$/g, '')
    .replace(/\s+/g, '');
  if (!LATEX_FRACTION.test(text) && !PLAIN_FRACTION.test(text)) return false;
  const parsed = parseExactRational(text);
  return parsed !== null && parsed.denominator !== 1n;
}

export function sanitizeFractionPart(value: string): string {
  const compact = value.replace(/\s+/g, '').replace(/[−–—]/g, '-');
  const negative = compact.startsWith('-');
  const digits = compact.replace(/\D/g, '');
  if (!digits) return negative ? '-' : '';
  return negative ? `-${digits}` : digits;
}

/** `null`, если в поле уже лежит не дробь — тогда оставляем обычную строку. */
export function readFractionDraft(
  value: string,
): { numerator: string; denominator: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return { numerator: '', denominator: '' };
  const match = trimmed.match(FRACTION_DRAFT);
  if (!match) return null;
  return { numerator: match[1] ?? '', denominator: match[2] ?? '' };
}

export function writeFractionDraft(numerator: string, denominator: string): string {
  if (!numerator && !denominator) return '';
  return `${numerator}/${denominator}`;
}
