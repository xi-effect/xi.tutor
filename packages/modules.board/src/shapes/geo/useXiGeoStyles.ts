import { useMemo } from 'react';
import { useEditor } from '@ibodr/draw';
import type { XiGeoShape } from './type';
import {
  DEFAULT_BG_COLOR,
  DEFAULT_BORDER_COLOR,
  getBoardColorOption,
  type TColorOption,
} from '../../utils/boardColors';

export const useXiGeoStyles = () => {
  const editor = useEditor();
  const selectedShapes = editor.getSelectedShapes();
  const shapeProps = useMemo(() => {
    const shape = selectedShapes[0];
    return shape?.type === 'xi-geo' ? (shape as XiGeoShape).props : undefined;
  }, [selectedShapes]);

  const bgColorOption = useMemo(
    () => (shapeProps?.color ? getBoardColorOption(shapeProps.color) : undefined),
    [shapeProps],
  );

  const bgCurrentColorClass = bgColorOption?.class ?? DEFAULT_BG_COLOR;
  const bgCurrentColorCss = bgColorOption?.cssVar;

  const isBorderNone = shapeProps?.borderColor === 'none';

  const currentBorderColorOption = useMemo((): TColorOption | undefined => {
    if (!shapeProps?.borderColor || shapeProps.borderColor === 'none') return undefined;
    return getBoardColorOption(shapeProps.borderColor);
  }, [shapeProps]);

  const borderCurrentColorClass = currentBorderColorOption?.class ?? DEFAULT_BORDER_COLOR;
  const borderCurrentColorCss = currentBorderColorOption
    ? getBoardColorOption(currentBorderColorOption.name)?.cssVar
    : undefined;

  const currentBorderThickness = shapeProps?.size || 'm';
  const currentFillType = shapeProps?.fill || 'semi';

  return {
    bgCurrentColorClass,
    bgCurrentColorCss,
    currentBorderColorOption,
    borderCurrentColorClass,
    borderCurrentColorCss,
    currentBorderThickness,
    currentFillType,
    isBorderNone,
  };
};
