import { useMemo } from 'react';
import { useEditor } from 'tldraw';
import { TShareShape } from './type';
import {
  borderColorOptions,
  colorOptions,
  DEFAULT_BG_COLOR,
  DEFAULT_BORDER_COLOR,
  TColorOption,
} from '../../utils/customConfig';

export const useXiGeoStyles = () => {
  const editor = useEditor();
  const selectedShapes = editor.getSelectedShapes();
  const shapeProps = useMemo(() => (selectedShapes[0] as TShareShape).props, [selectedShapes]);

  const bgCurrentColorClass = useMemo((): string => {
    try {
      if (shapeProps?.color) {
        const colorOption = colorOptions.find((opt) => opt.name === shapeProps.color);

        if (colorOption) return colorOption.class;
      }
    } catch (error) {
      console.warn('Error getting shape color:', error);
    }

    return DEFAULT_BG_COLOR;
  }, [shapeProps]);

  const currentBorderColorOption = useMemo((): TColorOption | undefined => {
    if (shapeProps?.borderColor)
      return borderColorOptions.find((opt) => opt.name === shapeProps.borderColor);
  }, [shapeProps]);

  const borderCurrentColorClass = useMemo((): string => {
    if (shapeProps?.borderColor && currentBorderColorOption) return currentBorderColorOption.class;

    return DEFAULT_BORDER_COLOR;
  }, [currentBorderColorOption, shapeProps]);

  const currentBorderThickness = shapeProps?.size || 'm';

  const currentFillType = shapeProps?.fill || 'semi';

  return {
    bgCurrentColorClass,
    currentBorderColorOption,
    borderCurrentColorClass,
    currentBorderThickness,
    currentFillType,
  };
};
