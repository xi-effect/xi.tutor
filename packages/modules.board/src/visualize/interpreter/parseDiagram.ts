import type { LegacyVisualizationSuggestion } from '../types';

const ARROW = /\s*(?:→|->|=>|⇒)\s*/;

export function parseDiagram(content: string): LegacyVisualizationSuggestion[] {
  const lines = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const chainFromLines: string[] = [];
  for (const line of lines) {
    if (ARROW.test(line) && line.split(ARROW).length >= 2) {
      chainFromLines.push(
        ...line
          .split(ARROW)
          .map((part) => part.trim())
          .filter(Boolean),
      );
    }
  }

  let labels = chainFromLines;
  if (labels.length < 2 && lines.length >= 2 && lines.every((line) => !line.includes('='))) {
    const shortLines = lines.filter((line) => line.length <= 40 && !/[.!?]$/.test(line));
    if (shortLines.length >= 2 && shortLines.length === lines.length) {
      labels = shortLines;
    }
  }

  const unique = labels.filter(
    (label, index) => labels.findIndex((item) => item === label) === index,
  );
  if (unique.length < 2) return [];
  if (unique.length === 2 && unique.some((label) => label.length > 48)) return [];

  const nodes = unique.map((label, index) => ({
    id: `n${index + 1}`,
    label,
  }));
  const edges = nodes.slice(0, -1).map((node, index) => ({
    from: node.id,
    to: nodes[index + 1].id,
  }));

  return [
    {
      intent: {
        type: 'diagram',
        nodes,
        edges,
      },
      confidence: ARROW.test(content) ? 0.86 : 0.62,
      labelKey: 'visualize.actions.diagram',
      summary: unique.join(' → '),
    },
  ];
}
