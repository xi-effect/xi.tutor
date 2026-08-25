import { OCR_LANGUAGES, type OcrLanguage, type OcrLanguageChoice } from './types';

export type ResolveOcrLanguageInput = {
  selection: OcrLanguageChoice;
  lastResolvedLanguage?: OcrLanguage | null;
  contextualLanguage?: OcrLanguage | null;
  fallbackLanguage?: OcrLanguage;
};

/**
 * Auto без перебора моделей: явный язык, иначе последний, иначе контекст кабинета.
 * Слоты last/contextual оставляют место для будущего автоопределения.
 */
export function resolveOcrLanguage({
  selection,
  lastResolvedLanguage,
  contextualLanguage,
  fallbackLanguage = 'ru',
}: ResolveOcrLanguageInput): OcrLanguage {
  if (selection !== 'auto') return selection;
  return lastResolvedLanguage ?? contextualLanguage ?? fallbackLanguage;
}

const SUBJECT_LANGUAGE_PATTERNS: ReadonlyArray<readonly [RegExp, OcrLanguage]> = [
  [/англ|english/i, 'en'],
  [/немец|deutsch|german/i, 'de'],
  [/франц|français|francais|french/i, 'fr'],
  [/испан|español|espanol|spanish/i, 'es'],
  [/итал|italiano|italian/i, 'it'],
  [/япон|日本語|japanese/i, 'ja'],
  [/китай|中文|chinese/i, 'zh'],
  [/русск|russian/i, 'ru'],
];

export function inferOcrLanguageFromSubject(subjectName?: string | null): OcrLanguage | null {
  if (!subjectName?.trim()) return null;
  for (const [pattern, language] of SUBJECT_LANGUAGE_PATTERNS) {
    if (pattern.test(subjectName)) return language;
  }
  return null;
}

export function inferOcrLanguageFromUiLocale(locale?: string | null): OcrLanguage | null {
  if (!locale) return null;
  const code = locale.toLowerCase().slice(0, 2);
  return OCR_LANGUAGES.find((language) => language === code) ?? null;
}

export function isOcrLanguage(value: unknown): value is OcrLanguage {
  return typeof value === 'string' && (OCR_LANGUAGES as readonly string[]).includes(value);
}

export function isOcrLanguageChoice(value: unknown): value is OcrLanguageChoice {
  return value === 'auto' || isOcrLanguage(value);
}
