import type { Editor } from '@ibodr/draw';
import * as Y from 'yjs';
import {
  DEFAULT_BOARD_BACKGROUND_COLOR,
  DEFAULT_BOARD_BACKGROUND_TYPE,
  getBoardBackgroundColorValue,
  isBoardBackgroundColorId,
  normalizeBoardBackgroundType,
  STAFF_BOARD_BACKGROUND_TYPE,
  type BoardBackgroundColorId,
  type BoardBackgroundPattern,
  type BoardColorAppearance,
} from '../config';

export type BoardBackgroundState = {
  type: BoardBackgroundPattern;
  color: BoardBackgroundColorId;
};

export const DEFAULT_BOARD_BACKGROUND: BoardBackgroundState = {
  type: DEFAULT_BOARD_BACKGROUND_TYPE,
  color: DEFAULT_BOARD_BACKGROUND_COLOR,
};

export function parseBoardBackgroundFromYMap(map: Y.Map<string>): BoardBackgroundState {
  const type = map.get('type');
  const color = map.get('color');

  return {
    type: normalizeBoardBackgroundType(type),
    color: isBoardBackgroundColorId(color) ? color : DEFAULT_BOARD_BACKGROUND.color,
  };
}

export function applyBoardBackgroundToEditor(
  editor: Editor,
  background: BoardBackgroundState,
  appearance: BoardColorAppearance = 'light',
) {
  const type = normalizeBoardBackgroundType(background.type);
  const isStaff = type === STAFF_BOARD_BACKGROUND_TYPE;

  // Нотный стан не входит в enum ядра: узор рисует наш Background, а редактору
  // отдаём пустой фон без точечной сетки.
  editor.updateInstanceState({
    backgroundType: isStaff ? 'none' : type,
    isGridMode: !isStaff && type !== 'none',
  });

  const backgroundColor = getBoardBackgroundColorValue(background.color, appearance);

  editor.getContainer().style.setProperty('--dr-color-background', backgroundColor);
}
