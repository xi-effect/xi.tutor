import { Box, Editor } from '@ibodr/draw';

const GAP = 10;

export const resolveShapeCoordinates = (
  editor: Editor,
  shapeWidth: number,
  shapeHeight: number,
) => {
  const shapes = editor.getCurrentPageShapes();
  const viewportCenter = editor.getViewportPageBounds().center;

  const shapeCoordinates = {
    x: viewportCenter.x - shapeWidth / 2,
    y: viewportCenter.y - shapeHeight / 2,
  };

  if (shapes.length) {
    const shapeBox = new Box(shapeCoordinates.x, shapeCoordinates.y, shapeWidth, shapeHeight);

    const existingBounds = shapes
      .map((shape) => editor.getShapePageBounds(shape.id))
      .filter((bounds): bounds is Box => bounds !== undefined);

    // Проверяем, пересекается ли shapeBox с существующими фигурами и смещаем правее при пересечении
    while (existingBounds.some((bound) => shapeBox.collides(bound))) {
      shapeCoordinates.x += shapeWidth / 2 + GAP;
      shapeBox.x = shapeCoordinates.x;
    }
  }

  return shapeCoordinates;
};
