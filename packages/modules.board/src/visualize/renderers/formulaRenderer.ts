import type { FormulaIntent } from '../intent/schemas';
import { toDisplayMath } from '../interpreter/normalizeMathText';
import { createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderer } from './types';

export const formulaRenderer: VisualizationRenderer<FormulaIntent> = {
  render(intent, context) {
    const id = createBoardText(
      context.editor,
      context,
      context.origin.x,
      context.origin.y,
      toDisplayMath(intent.text),
      280,
    );
    return { createdShapeIds: [id] };
  },
};
