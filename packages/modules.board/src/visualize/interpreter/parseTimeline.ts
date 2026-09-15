import type { LegacyVisualizationSuggestion } from '../types';

const EVENT_LINE = /^\s*(\d{3,4})\s*[-–—]\s*(.+?)\s*$/;

export function parseTimeline(content: string): LegacyVisualizationSuggestion[] {
  const events: Array<{ year: string; label: string }> = [];

  for (const line of content.split(/\n+/)) {
    const match = line.match(EVENT_LINE);
    if (!match) continue;
    const year = match[1];
    const label = match[2]?.trim();
    if (!year || !label) continue;
    events.push({ year, label });
  }

  if (events.length < 2) return [];

  return [
    {
      intent: {
        type: 'timeline',
        events,
      },
      confidence: 0.84,
      labelKey: 'visualize.actions.timeline',
      summary: events.map((event) => `${event.year} — ${event.label}`).join('; '),
    },
  ];
}
