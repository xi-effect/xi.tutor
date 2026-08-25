export function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function answersMatch(value: string, answers: readonly string[]): boolean {
  const normalized = normalizeAnswer(value);
  if (!normalized) return false;
  return answers.some((answer) => normalizeAnswer(answer) === normalized);
}

export function parseAnswerList(raw: string): string[] {
  return raw
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
}

const GAP_TOKEN = /\{\{([^}]+)\}\}/g;

export type GapTextSegment = { type: 'text'; text: string } | { type: 'gap'; id: string };

export function parseGapSourceText(sourceText: string): GapTextSegment[] {
  const segments: GapTextSegment[] = [];
  let lastIndex = 0;
  const pattern = new RegExp(GAP_TOKEN);
  for (const match of sourceText.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: 'text', text: sourceText.slice(lastIndex, index) });
    }
    segments.push({ type: 'gap', id: match[1] ?? '' });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < sourceText.length) {
    segments.push({ type: 'text', text: sourceText.slice(lastIndex) });
  }
  return segments;
}
