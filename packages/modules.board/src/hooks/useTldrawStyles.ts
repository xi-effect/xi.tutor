import { useEditor } from 'tldraw';
import { DefaultColorStyle, DefaultSizeStyle, STROKE_SIZES } from 'tldraw';
import {
  DEFAULT_PEN_COLOR,
  DEFAULT_PEN_OPACITY,
  DEFAULT_PEN_THICKNESS,
} from '../ui/components/config';

export const useTldrawStyles = () => {
  const editor = useEditor();

  const resetToDefaults = () => {
    editor.setStyleForNextShapes(DefaultColorStyle, DEFAULT_PEN_COLOR);
    editor.setStyleForNextShapes(DefaultSizeStyle, DEFAULT_PEN_THICKNESS);
    editor.setOpacityForNextShapes(DEFAULT_PEN_OPACITY);
  };

  const setColor = (colorName: string) => {
    try {
      editor.setStyleForNextShapes(DefaultColorStyle, colorName);
    } catch (error) {
      console.warn('Error setting color:', error);
    }
  };

  const setThickness = (size: 's' | 'm' | 'l' | 'xl') => {
    try {
      editor.setStyleForNextShapes(DefaultSizeStyle, size);
    } catch (error) {
      console.warn('Error setting thickness:', error);
    }
  };

  const setThicknessPx = (px: number) => {
    try {
      // Подменяем размер 'l' на произвольное значение в пикселях
      STROKE_SIZES.l = px;
      editor.setStyleForNextShapes(DefaultSizeStyle, 'l');
    } catch (error) {
      console.warn('Error setting thickness px:', error);
    }
  };

  const setOpacity = (opacity: number) => {
    try {
      // Конвертируем из процентов (0-100) в десятичную дробь (0-1)
      const alpha = opacity / 100;
      editor.setOpacityForNextShapes(alpha);
    } catch (error) {
      console.warn('Error setting opacity:', error);
    }
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
    resetToDefaults,
    setColor,
    setThickness,
    setThicknessPx,
    setOpacity,
    setSelectedShapesColor,
    setSelectedShapesThickness,
    setSelectedShapesOpacity,
  };
};
