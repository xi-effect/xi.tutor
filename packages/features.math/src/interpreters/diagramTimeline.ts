import type { MathInterpreterModule } from '../core/types';

export const arrowDiagramInterpreter: MathInterpreterModule = {
  id: 'arrow-diagram',
  canInterpret(input) {
    return input.text.includes('→') ? 0.75 : 0;
  },
  interpret(input) {
    const parts = input.text
      .split('→')
      .map((x) => x.trim())
      .filter(Boolean);
    if (parts.length < 2) return [];
    const nodes = parts.map((label, i) => ({ id: `n${i}`, label }));
    const edges = nodes.slice(1).map((node, i) => ({ from: nodes[i].id, to: node.id }));
    return [
      {
        id: 'arrow-diagram',
        label: 'Построить схему',
        confidence: 0.75,
        intent: { type: 'diagram', nodes, edges },
      },
    ];
  },
};

export const timelineInterpreter: MathInterpreterModule = {
  id: 'timeline',
  canInterpret(input) {
    const matches = [...input.text.matchAll(/\b(1\d{3}|20\d{2})\s*[-—–:]\s*([^\n]+)/g)];
    return matches.length >= 2 ? 0.85 : 0;
  },
  interpret(input) {
    const events = [...input.text.matchAll(/\b(1\d{3}|20\d{2})\s*[-—–:]\s*([^\n]+)/g)].map((m) => ({
      year: Number(m[1]),
      label: m[2].trim(),
    }));
    return events.length >= 2
      ? [
          {
            id: 'timeline',
            label: 'Построить временную шкалу',
            confidence: 0.85,
            intent: { type: 'timeline', events },
          },
        ]
      : [];
  },
};
