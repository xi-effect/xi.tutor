import { DrShape, Editor } from '@ibodr/draw';
import { ShapeWithRichTextT } from '../types';

const hasRichText = (
  shape: ReturnType<Editor['getSelectedShapes']>[number],
): shape is ShapeWithRichTextT => {
  return 'richText' in shape.props && shape.props.richText != null;
};

export const getShapesWithRichText = (shapes: DrShape[]): ShapeWithRichTextT[] => {
  return shapes.filter(hasRichText);
};
