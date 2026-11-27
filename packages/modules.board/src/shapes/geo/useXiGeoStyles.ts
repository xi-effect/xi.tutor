import { useMemo } from 'react';
import { useEditor, useValue } from '@ibodr/draw';
import {
  DEFAULT_BG_COLOR,
  DEFAULT_BORDER_COLOR,
  getBoardColorOption,
  type TColorOption,
} from '../../utils/boardColors';

type GeoStyleProps = {
  color?: string;
  fill?: string;
  size?: string;
  borderColor?: string;
};

export const useXiGeoStyles = () => {
  const editor = useEditor();
  // useValue, а не getSelectedShapes() в рендере: React Compiler мемоизирует
  // вызов по стабильному editor, и слайдер толщины залипает на первом значении.
  const shapeProps = useValue(
    'xi-geo-style-props',
    (): GeoStyleProps | undefined => {
      const shape = editor.getSelectedShapes()[0] as
        { type?: string; props?: GeoStyleProps } | undefined;
      if (shape?.type !== 'xi-geo' && shape?.type !== 'xi-polygon') return undefined;
      return shape.props;
    },
    [editor],
  );

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
