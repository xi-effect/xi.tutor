import { useCallback, useEffect, useState } from 'react';
import { Editor } from '@ibodr/draw';
import { getMarkTypes, hasBulletListNode } from '../utils/richTextUtils';
import { getShapesWithRichText } from '../utils/shapeUtils';
import type { ActiveFormatesMapT } from '../types';

const defaultActiveStatuses: ActiveFormatesMapT = {
  bold: false,
  italic: false,
  strike: false,
  underline: false,
  highlight: false,
  link: false,
  bulletList: false,
};

export const useActiveStatuses = (editor: Editor) => {
  const [activeStatuses, setActiveStatuses] = useState<ActiveFormatesMapT>(defaultActiveStatuses);

  const recalcStatuses = useCallback(() => {
    const shapes = getShapesWithRichText(editor.getSelectedShapes());

    const richTexts = shapes.map((shape) => shape.props.richText);

    // Достаем массив уникальных форматов из меток текстовых узлов
    const markTypes = getMarkTypes(richTexts);

    // Собираем мапу из активных форматов
    const newStatuses = markTypes.reduce<ActiveFormatesMapT>((sum, mark) => {
      sum[mark] = true;
      return sum;
    }, {} as ActiveFormatesMapT);
    newStatuses.bulletList = hasBulletListNode(richTexts);

    setActiveStatuses({ ...defaultActiveStatuses, ...newStatuses });
  }, [editor]);

  useEffect(() => {
    recalcStatuses();
  }, [recalcStatuses]);

  const updateActiveStatuses = useCallback(() => {
    recalcStatuses();
  }, [recalcStatuses]);

  return { activeStatuses, updateActiveStatuses };
};
