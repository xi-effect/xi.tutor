import type { LegacyVisualizationSuggestion } from '../types';
import { normalizeMathText } from './normalizeMathText';

const POINT_PATTERN =
  /(?:^|[\s,;:.(])([A-Za-zА-Яа-яЁё])\s*\(\s*(-?\d+(?:\.\d+)?)\s*[;,]\s*(-?\d+(?:\.\d+)?)\s*\)/g;

export function parseCoordinatePoints(content: string): LegacyVisualizationSuggestion[] {
  const normalized = normalizeMathText(content);
  const points: Array<{ name: string; x: number; y: number }> = [];
  const seen = new Set<string>();

  for (const match of normalized.matchAll(POINT_PATTERN)) {
    const name = match[1];
    const x = Number(match[2]);
    const y = Number(match[3]);
    if (!name || !Number.isFinite(x) || !Number.isFinite(y)) continue;
    const key = `${name}:${x}:${y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    points.push({ name: name.toUpperCase(), x, y });
  }

  if (points.length === 0) return [];

  const connect = /соедините|соединить|ломан|polygon|connect/i.test(content);

  return [
    {
      intent: {
        type: 'coordinate_points',
        points,
        connect,
      },
      confidence: 0.92,
      labelKey: 'visualize.actions.coordinate_points',
      summary: points.map((point) => `${point.name}(${point.x}; ${point.y})`).join(', '),
    },
  ];
}
