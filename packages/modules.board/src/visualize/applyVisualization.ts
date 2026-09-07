import type { DrShapeId, Editor } from '@ibodr/draw';
import { extractSelectedText } from './extractSelectedText';
import { SovliumMathBoardAdapter } from './adapter/SovliumMathBoardAdapter';
import type { VisualizationSuggestion } from './types';

export type ApplyVisualizationResult =
  { ok: true; createdShapeIds: DrShapeId[] } | { ok: false; error: string };

export function applyVisualizationSuggestion(
  editor: Editor,
  suggestion: VisualizationSuggestion,
): ApplyVisualizationResult {
  try {
    const { source } = extractSelectedText(editor);
    if (!source) {
      return { ok: false, error: 'Source shape is missing' };
    }

    const adapter = new SovliumMathBoardAdapter(editor, source);
    editor.markHistoryStoppingPoint('visualize-content');
    let createdShapeIds: DrShapeId[] = [];

    editor.run(() => {
      createdShapeIds = adapter.renderIntent(suggestion.intent);
      if (createdShapeIds.length > 1) {
        editor.groupShapes(createdShapeIds);
      }
      if (createdShapeIds.length > 0) {
        editor.setSelectedShapes(createdShapeIds);
      }
      editor.setCurrentTool('select');
    });

    if (createdShapeIds.length === 0) {
      return { ok: false, error: 'Empty visualization' };
    }

    return { ok: true, createdShapeIds };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Visualization failed',
    };
  }
}
