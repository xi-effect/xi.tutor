export type OcrLineLike = {
  text: string;
  score?: number;
  poly?: Array<{ x: number; y: number } | [number, number]>;
};

function lineY(item: OcrLineLike): number {
  const first = item.poly?.[0];
  if (!first) return 0;
  return Array.isArray(first) ? first[1] : first.y;
}

function lineX(item: OcrLineLike): number {
  const first = item.poly?.[0];
  if (!first) return 0;
  return Array.isArray(first) ? first[0] : first.x;
}

export function textFromOcrItems(items: OcrLineLike[] | undefined): {
  text: string;
  confidence?: number;
} {
  if (!items?.length) return { text: '' };

  const sorted = [...items].sort((a, b) => {
    const dy = lineY(a) - lineY(b);
    if (Math.abs(dy) > 12) return dy;
    return lineX(a) - lineX(b);
  });

  const text = sorted
    .map((item) => item.text.trim())
    .filter(Boolean)
    .join('\n')
    .trim();

  const scores = sorted
    .map((item) => item.score)
    .filter((score): score is number => typeof score === 'number' && Number.isFinite(score));

  const confidence =
    scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : undefined;

  return { text, confidence };
}
