export type ExactRational = {
  numerator: bigint;
  denominator: bigint;
};

const DIGIT_LIMIT = 18;

const gcd = (left: bigint, right: bigint): bigint => {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b !== 0n) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a === 0n ? 1n : a;
};

export const exactRational = (numerator: bigint, denominator: bigint): ExactRational | null => {
  if (denominator === 0n) return null;
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
};

export const rationalsEqual = (left: ExactRational, right: ExactRational) =>
  left.numerator === right.numerator && left.denominator === right.denominator;

/** Конечная десятичная запись со знаком и запятой. `null`, если дробь периодическая. */
export const formatTerminatingDecimal = (value: ExactRational): string | null => {
  let factor = value.denominator;
  while (factor % 2n === 0n) factor /= 2n;
  while (factor % 5n === 0n) factor /= 5n;
  if (factor !== 1n) return null;

  const sign = value.numerator < 0n ? '-' : '';
  let remainder = value.numerator < 0n ? -value.numerator : value.numerator;
  const whole = remainder / value.denominator;
  remainder %= value.denominator;

  let digits = '';
  while (remainder !== 0n) {
    remainder *= 10n;
    digits += String(remainder / value.denominator);
    remainder %= value.denominator;
    if (digits.length > DIGIT_LIMIT) return null;
  }

  return digits ? `${sign}${whole},${digits}` : `${sign}${whole}`;
};

const DECIMAL = /^([+-])?(\d+)(?:[.,](\d+))?$/;
const SLASH = /^([+-]?\d+)\/([+-]?\d+)$/;
const LATEX_FRACTION = /^\\frac\{([+-]?\d+)\}\{([+-]?\d+)\}$/;

/** Целиком строка: целое, конечная десятичная или обыкновенная дробь, в том числе `\frac{a}{b}`. */
export const parseExactRational = (raw: string): ExactRational | null => {
  let text = raw.normalize('NFKC').trim().replace(/[−–—]/g, '-').replace(/\s+/g, '');
  text = text.replace(/[.!?]+$/g, '').replace(/^\$+|\$+$/g, '');
  if (!text || text.length > 80) return null;

  const fraction = text.match(LATEX_FRACTION) ?? text.match(SLASH);
  if (fraction) {
    return exactRational(BigInt(fraction[1] ?? '0'), BigInt(fraction[2] ?? '0'));
  }

  const decimal = text.match(DECIMAL);
  if (!decimal) return null;
  const fractionDigits = decimal[3] ?? '';
  const digits = `${decimal[2] ?? ''}${fractionDigits}`;
  if (!digits || digits.length > DIGIT_LIMIT) return null;

  const sign = decimal[1] === '-' ? -1n : 1n;
  const scale = 10n ** BigInt(fractionDigits.length);
  return exactRational(sign * BigInt(digits), scale);
};

export const exactRationalsMatch = (input: string, accepted: readonly string[]): boolean => {
  const given = parseExactRational(input);
  if (!given) return false;

  return accepted.some((answer) => {
    const expected = parseExactRational(answer);
    return expected !== null && rationalsEqual(given, expected);
  });
};

/** Формы одного и того же числа: сокращённая дробь и конечная десятичная с запятой и точкой. */
export const equivalentRationalForms = (raw: string): string[] => {
  const parsed = parseExactRational(raw);
  if (!parsed) return [];

  const forms: string[] = [];
  if (parsed.denominator === 1n) {
    forms.push(String(parsed.numerator));
  } else {
    forms.push(`${parsed.numerator}/${parsed.denominator}`);
    forms.push(`\\frac{${parsed.numerator}}{${parsed.denominator}}`);
  }

  const decimal = formatTerminatingDecimal(parsed);
  if (!decimal) return forms;

  forms.push(decimal);
  if (decimal.includes(',')) forms.push(decimal.replace(/,/g, '.'));
  return forms;
};
