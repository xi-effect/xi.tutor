import { useEditor } from 'tldraw';
import { DefaultColorStyle, DefaultSizeStyle, STROKE_SIZES } from 'tldraw';
import { useEffect, useState, useRef } from 'react';
import { useTldrawStore } from '../store/useTldrawStore';

export const useTldrawStyles = () => {
  const editor = useEditor();
  const [currentColor, setCurrentColor] = useState<string>('black');
  const [currentThickness, setCurrentThickness] = useState<'s' | 'm' | 'l' | 'xl'>('m');
  const [currentOpacity, setCurrentOpacity] = useState<number>(100);
  const isResetting = useRef(false);

  // Получаем значения из стора
  const { setPencilColor, setPencilThickness, setPencilOpacity } = useTldrawStore();

  // Подписываемся на изменения стилей в редакторе
  useEffect(() => {
    const updateStyles = () => {
      const editorColor = editor.getStyleForNextShape(DefaultColorStyle) as string;
      const editorThickness = editor.getStyleForNextShape(DefaultSizeStyle) as
        | 's'
        | 'm'
        | 'l'
        | 'xl';
      const editorOpacity = editor.getInstanceState().opacityForNextShape;
      const editorOpacityPercent = Math.round((editorOpacity || 1) * 100);

      setCurrentColor(editorColor);
      setCurrentThickness(editorThickness);
      setCurrentOpacity(editorOpacityPercent);

      // Сохраняем в стор только если это не сброс настроек
      if (!isResetting.current) {
        setPencilColor(editorColor);
        setPencilThickness(editorThickness);
        setPencilOpacity(editorOpacityPercent);
      }
    };

    // Обновляем стили при монтировании
    updateStyles();

    // Подписываемся на изменения
    const unsubscribe = editor.store.listen(() => {
      updateStyles();
    });

    return unsubscribe;
  }, [editor, setPencilColor, setPencilThickness, setPencilOpacity]);

  const setColor = (colorName: string) => {
    editor.setStyleForNextShapes(DefaultColorStyle, colorName);
    if (!isResetting.current) {
      setPencilColor(colorName);
    }
  };

  const setThickness = (size: 's' | 'm' | 'l' | 'xl') => {
    editor.setStyleForNextShapes(DefaultSizeStyle, size);
    if (!isResetting.current) {
      setPencilThickness(size);
    }
  };

  const setThicknessPx = (px: number) => {
    // Подменяем размер 'l' на произвольное значение в пикселях
    STROKE_SIZES.l = px;
    editor.setStyleForNextShapes(DefaultSizeStyle, 'l');
    if (!isResetting.current) {
      setPencilThickness('l');
    }
  };

  const setOpacity = (opacity: number) => {
    // Конвертируем из процентов (0-100) в десятичную дробь (0-1)
    const alpha = opacity / 100;
    editor.setOpacityForNextShapes(alpha);
    if (!isResetting.current) {
      setPencilOpacity(opacity);
    }
  };

  // Функция для сброса к дефолтным настройкам
  const resetToDefaults = () => {
    isResetting.current = true;
    setColor('black');
    setThickness('m');
    setOpacity(100);
    // Сбрасываем флаг после небольшой задержки
    setTimeout(() => {
      isResetting.current = false;
    }, 100);
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

  // Функции для получения текущих значений
  const getCurrentColor = () => {
    return currentColor;
  };

  const getCurrentThickness = () => {
    return currentThickness;
  };

  const getCurrentOpacity = () => {
    return currentOpacity;
  };

  return {
    setColor,
    setThickness,
    setThicknessPx,
    setOpacity,
    resetToDefaults,
    setSelectedShapesColor,
    setSelectedShapesThickness,
    setSelectedShapesOpacity,
    getCurrentColor,
    getCurrentThickness,
    getCurrentOpacity,
    currentColor,
    currentThickness,
    currentOpacity,
  };
};
