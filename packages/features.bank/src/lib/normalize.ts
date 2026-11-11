export const normalizeSearchText = (value: string) =>
  value
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}$^_\\]/g, ' ')
    .replace(/[^0-9a-zа-я]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Canonical form used by v3 content fingerprints. It preserves mathematical
 * operators so opposite-sign problems do not collapse to one fingerprint.
 */
export const canonicalizeForFingerprint = (value: string) =>
  value
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .replace(/−/g, '-')
    .replace(/·/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\(frac|sqrt|pi|sin|cos|tan|log|begin|end|overrightarrow)/g, ' $1 ')
    .replace(/[{}$^_\\,.;:!?()[\]]/g, ' ')
    .replace(/[^0-9a-zа-я+\-*/=<>]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
