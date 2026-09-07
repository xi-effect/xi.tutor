import type { MathVisualizationIntent } from 'features.math';
import type { VisualizationIntent, VisualizationIntentType } from './intent/schemas';

export type VisualizationSuggestion = {
  intent: MathVisualizationIntent;
  confidence: number;
  label: string;
  summary: string;
};

export type LegacyVisualizationSuggestion = {
  intent: VisualizationIntent;
  confidence: number;
  labelKey: `visualize.actions.${VisualizationIntentType}`;
  summary: string;
};

export interface ContentInterpreter {
  interpret(content: string): Promise<VisualizationSuggestion[]>;
}
