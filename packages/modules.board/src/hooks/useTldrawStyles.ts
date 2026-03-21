import { useEditor } from 'tldraw';
import { DefaultColorStyle, DefaultSizeStyle, STROKE_SIZES } from 'tldraw';
import { useCallback } from 'react';
import {
  DEFAULT_PEN_COLOR,
  DEFAULT_PEN_OPACITY,
  DEFAULT_PEN_THICKNESS,
} from '../ui/components/config';

const DEFAULT_STROKE_SIZE_S = STROKE_SIZES.s;
const XS_STROKE_SIZE_S = Math.max(1, Math.round(DEFAULT_STROKE_SIZE_S / 2));

export const useTldrawStyles = () => {
  const editor = useEditor();

  const resetToDefaults = useCallback(() => {
    if (!editor) return;
    editor.setStyleForNextShapes(DefaultColorStyle, DEFAULT_PEN_COLOR);
    editor.setStyleForNextShapes(DefaultSizeStyle, DEFAULT_PEN_THICKNESS);
    editor.setOpacityForNextShapes(DEFAULT_PEN_OPACITY);
  }, [editor]);

  const setColor = useCallback(
    (colorName: string) => {
      if (!editor) return;
      try {
        editor.setStyleForNextShapes(DefaultColorStyle, colorName);
      } catch (error) {
        console.warn('Error setting color:', error);
      }
    },
    [editor],
  );

  const setThickness = useCallback(
    (size: 'xs' | 's' | 'm' | 'l' | 'xl') => {
      if (!editor) return;
      try {
        if (size === 'xs') {
          STROKE_SIZES.s = XS_STROKE_SIZE_S;
          editor.setStyleForNextShapes(DefaultSizeStyle, 's');
          return;
        }

        STROKE_SIZES.s = DEFAULT_STROKE_SIZE_S;
        editor.setStyleForNextShapes(DefaultSizeStyle, size);
      } catch (error) {
        console.warn('Error setting thickness:', error);
      }
    },
    [editor],
  );

  const setThicknessPx = useCallback(
    (px: number) => {
      if (!editor) return;
      try {
        // Подменяем размер 'l' на произвольное значение в пикселях
        STROKE_SIZES.l = px;
        editor.setStyleForNextShapes(DefaultSizeStyle, 'l');
      } catch (error) {
        console.warn('Error setting thickness px:', error);
      }
    },
    [editor],
  );

  const setOpacity = useCallback(
    (opacity: number) => {
      if (!editor) return;
      try {
        // Конвертируем из процентов (0-100) в десятичную дробь (0-1)
        const alpha = opacity / 100;
        editor.setOpacityForNextShapes(alpha);
      } catch (error) {
        console.warn('Error setting opacity:', error);
      }
    },
    [editor],
  );

  const setSelectedShapesColor = useCallback(
    (colorName: string) => {
      if (!editor) return;
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
    },
    [editor],
  );

  const setSelectedShapesThickness = useCallback(
    (size: 'xs' | 's' | 'm' | 'l' | 'xl') => {
      if (!editor) return;
      if (size === 'xs') {
        STROKE_SIZES.s = XS_STROKE_SIZE_S;
        editor.setStyleForSelectedShapes(DefaultSizeStyle, 's');
        return;
      }

      STROKE_SIZES.s = DEFAULT_STROKE_SIZE_S;
      editor.setStyleForSelectedShapes(DefaultSizeStyle, size);
    },
    [editor],
  );

  const setSelectedShapesOpacity = useCallback(
    (opacity: number) => {
      if (!editor) return;
      const alpha = opacity / 100;
      editor.setOpacityForSelectedShapes(alpha);
    },
    [editor],
  );

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
