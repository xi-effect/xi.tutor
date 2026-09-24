import type { DrShapeId } from '@ibodr/draw';
import type { DiagramIntent } from '../intent/schemas';
import { createBoardArrow, createBoardRectangle } from './createBoardPrimitives';
import type { VisualizationRenderer } from './types';

const NODE_W = 160;
const NODE_H = 56;
const GAP = 48;

export const diagramRenderer: VisualizationRenderer<DiagramIntent> = {
  render(intent, context) {
    const createdShapeIds: DrShapeId[] = [];
    const positions = new Map<string, { x: number; y: number }>();

    intent.nodes.forEach((node, index) => {
      const x = context.origin.x + index * (NODE_W + GAP);
      const y = context.origin.y;
      positions.set(node.id, { x, y });
      createdShapeIds.push(
        createBoardRectangle(context.editor, context, x, y, NODE_W, NODE_H, node.label),
      );
    });

    for (const edge of intent.edges) {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      if (!from || !to) continue;
      createdShapeIds.push(
        createBoardArrow(
          context.editor,
          context,
          from.x + NODE_W,
          from.y + NODE_H / 2,
          { x: 0, y: 0 },
          { x: GAP, y: 0 },
        ),
      );
    }

    return { createdShapeIds };
  },
};
