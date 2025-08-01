import { useEditor } from 'tldraw';
import { DefaultColorStyle, DefaultSizeStyle, STROKE_SIZES } from 'tldraw';

export const useTldrawStyles = () => {
  const editor = useEditor();

  const setColor = (colorName: string) => {
    editor.setStyleForNextShapes(DefaultColorStyle, colorName);
  };

  const setThickness = (size: 's' | 'm' | 'l' | 'xl') => {
    editor.setStyleForNextShapes(DefaultSizeStyle, size);
  };

  const setThicknessPx = (px: number) => {
    // Подменяем размер 'l' на произвольное значение в пикселях
    STROKE_SIZES.l = px;
    editor.setStyleForNextShapes(DefaultSizeStyle, 'l');
  };

  const setOpacity = (opacity: number) => {
    // Конвертируем из процентов (0-100) в десятичную дробь (0-1)
    const alpha = opacity / 100;
    editor.setOpacityForNextShapes(alpha);
  };

  const setSelectedShapesColor = (colorName: string) => {
    editor.setStyleForSelectedShapes(
      DefaultColorStyle,
      colorName as
        | 'black'
        | 'blue'
        | 'red'
        | 'green'
        | 'orange'
        | 'yellow'
        | 'violet'
        | 'light-violet'
        | 'light-blue'
        | 'grey'
        | 'light-green'
        | 'light-red'
        | 'white',
    );
  };

  const setSelectedShapesThickness = (size: 's' | 'm' | 'l' | 'xl') => {
    editor.setStyleForSelectedShapes(DefaultSizeStyle, size);
  };

  const setSelectedShapesOpacity = (opacity: number) => {
    const alpha = opacity / 100;
    editor.setOpacityForSelectedShapes(alpha);
  };

  return {
    setColor,
    setThickness,
    setThicknessPx,
    setOpacity,
    setSelectedShapesColor,
    setSelectedShapesThickness,
    setSelectedShapesOpacity,
  };
};
