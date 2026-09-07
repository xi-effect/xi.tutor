import type { MathInput, MathInterpreterModule, VisualizationSuggestion } from './types';
import { mathVisualizationIntentSchema } from './schema';
import { functionGraphInterpreter } from '../interpreters/functionGraph';
import { coordinatePointsInterpreter } from '../interpreters/coordinates';
import { numberLineInterpreter } from '../interpreters/numberLine';
import { fractionInterpreter } from '../interpreters/fraction';
import { ratioInterpreter, percentInterpreter } from '../interpreters/ratioPercent';
import { sequenceInterpreter } from '../interpreters/sequence';
import { probabilityInterpreter } from '../interpreters/probability';
import { geometryInterpreter } from '../interpreters/geometry';
import { arrowDiagramInterpreter, timelineInterpreter } from '../interpreters/diagramTimeline';
import { formulaInterpreter } from '../interpreters/formula';

export const defaultModules: MathInterpreterModule[] = [
  functionGraphInterpreter,
  coordinatePointsInterpreter,
  numberLineInterpreter,
  geometryInterpreter,
  fractionInterpreter,
  ratioInterpreter,
  percentInterpreter,
  sequenceInterpreter,
  probabilityInterpreter,
  formulaInterpreter,
  arrowDiagramInterpreter,
  timelineInterpreter,
];

export class MathVisualInterpreter {
  constructor(private readonly modules: MathInterpreterModule[] = defaultModules) {}

  interpret(input: MathInput, minConfidence = 0.5): VisualizationSuggestion[] {
    const candidates = this.modules
      .map((module) => ({ module, score: module.canInterpret(input) }))
      .filter((x) => x.score >= minConfidence)
      .sort((a, b) => b.score - a.score)
      .flatMap(({ module }) => module.interpret(input));

    const unique = new Map<string, VisualizationSuggestion>();
    for (const suggestion of candidates) {
      const parsed = mathVisualizationIntentSchema.safeParse(suggestion.intent);
      if (!parsed.success) continue;
      const key = JSON.stringify(parsed.data);
      if (!unique.has(key) || unique.get(key)!.confidence < suggestion.confidence)
        unique.set(key, suggestion);
    }

    return [...unique.values()].sort((a, b) => b.confidence - a.confidence);
  }
}
