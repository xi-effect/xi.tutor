const MATH_ALPHANUMERIC_RANGES: [number, number, number][] = [
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

function toAsciiMathCharacter(character: string): string {
  const codePoint = character.codePointAt(0) ?? 0;
  for (const [from, to, ascii] of MATH_ALPHANUMERIC_RANGES) {
    if (codePoint >= from && codePoint <= to) {
      return String.fromCharCode(ascii + codePoint - from);
    }
  }
  return character;
}

function compactSpacedTokens(text: string): string {
  return text
    .replace(
      /(^|[^A-ZА-Я])([A-ZА-Я](?:\s+[A-ZА-Я])+)(?![A-ZА-Я])/g,
      (_all, prefix, names) => `${prefix}${String(names).replace(/\s+/g, '')}`,
    )
    .replace(
      /(^|[^\d])(\d(?:\s+\d)+)(?!\d)/g,
      (_all, prefix, digits) => `${prefix}${String(digits).replace(/\s+/g, '')}`,
    );
}

export function normalizeGeometryText(input: string): string {
  return compactSpacedTokens(
    [...input]
      .map(toAsciiMathCharacter)
      .join('')
      .replace(/[\u2061-\u2064]/g, '')
      .replace(/\u00a0/g, ' ')
      .replace(/[–—−]/g, '-')
      .replace(/[×⋅·]/g, '*')
      .replace(/÷/g, '/')
      .replace(/\\circ\b/g, '°')
      .replace(/\\degree\b/g, '°')
      .replace(/\^\(?°\)?/g, '°')
      .replace(/\^\(circ\)/gi, '°')
      .replace(/\\(?:cos|sin|tan|cot|sec|csc)\b/gi, ' ')
      .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
      .replace(/sqrt\((\d+(?:\.\d+)?)\.\)/g, 'sqrt($1)')
      .replace(/\$+/g, ' ')
      .replace(/\\[()[\]]/g, ' ')
      .replace(/√\s*\(?\s*(\d+(?:[.,]\d+)?)\s*\)?/g, 'sqrt($1)')
      .replace(/(\d),(\d)/g, '$1.$2')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

export function normalizePointName(value: string): string {
  return value.trim().toUpperCase();
}

export function segmentPoints(value: string): [string, string] {
  const normalized = normalizePointName(value);
  return [normalized[0], normalized[1]];
}
